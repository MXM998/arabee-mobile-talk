import { useState, useEffect } from 'react';
import { Student, Level, Batch } from '@/types/app';
import { useToast } from '@/hooks/use-toast';

export function useStudentManager() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('arabee-student-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setBatches(data.batches || []);
        setCurrentBatch(data.currentBatch || null);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      batches,
      currentBatch
    };
    localStorage.setItem('arabee-student-data', JSON.stringify(dataToSave));
  }, [batches, currentBatch]);

  const createBatch = (name: string, number: number) => {
    const newBatch: Batch = {
      id: crypto.randomUUID(),
      name,
      number,
      levels: [
        {
          id: crypto.randomUUID(),
          name: 'المستوى الأول',
          sessionsCount: 4,
          students: []
        }
      ],
      createdAt: new Date()
    };

    setBatches(prev => [...prev, newBatch]);
    setCurrentBatch(newBatch);
    
    toast({
      title: "تم إنشاء الدفعة بنجاح",
      description: `دفعة ${name} - رقم ${number}`,
    });

    return newBatch;
  };

  const addStudent = (levelId: string, student: Omit<Student, 'id' | 'levelId' | 'points'>) => {
    if (!currentBatch) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      ...student,
      levelId,
      points: 0
    };

    const updatedBatch = {
      ...currentBatch,
      levels: currentBatch.levels.map(level =>
        level.id === levelId
          ? { ...level, students: [...level.students, newStudent] }
          : level
      )
    };

    setCurrentBatch(updatedBatch);
    setBatches(prev => prev.map(batch => batch.id === currentBatch.id ? updatedBatch : batch));
    
    toast({
      title: "تم إضافة الطالب بنجاح",
      description: newStudent.name,
    });
  };

  const updateStudentPoints = (studentId: string, pointsToAdd: number) => {
    if (!currentBatch) return;

    const updatedBatch = {
      ...currentBatch,
      levels: currentBatch.levels.map(level => ({
        ...level,
        students: level.students.map(student =>
          student.id === studentId
            ? { ...student, points: student.points + pointsToAdd }
            : student
        )
      }))
    };

    setCurrentBatch(updatedBatch);
    setBatches(prev => prev.map(batch => batch.id === currentBatch.id ? updatedBatch : batch));
    
    if (pointsToAdd > 0) {
      toast({
        title: "تم إضافة النقاط بنجاح",
        description: `${pointsToAdd} نقطة`,
      });
    }
  };

  const promoteStudent = (studentId: string) => {
    if (!currentBatch) return;

    const student = currentBatch.levels
      .flatMap(level => level.students)
      .find(s => s.id === studentId);
    
    if (!student) return;

    const currentLevelIndex = currentBatch.levels.findIndex(level => 
      level.students.some(s => s.id === studentId)
    );

    if (currentLevelIndex === -1) return;

    // Create next level if it doesn't exist
    let nextLevelIndex = currentLevelIndex + 1;
    let updatedLevels = [...currentBatch.levels];

    if (nextLevelIndex >= updatedLevels.length) {
      const newLevel: Level = {
        id: crypto.randomUUID(),
        name: `المستوى ${nextLevelIndex + 1}`,
        sessionsCount: 4,
        students: []
      };
      updatedLevels.push(newLevel);
    }

    // Move student to next level and reset points
    updatedLevels = updatedLevels.map((level, index) => {
      if (index === currentLevelIndex) {
        return {
          ...level,
          students: level.students.filter(s => s.id !== studentId)
        };
      } else if (index === nextLevelIndex) {
        return {
          ...level,
          students: [...level.students, { ...student, points: 0, levelId: level.id }]
        };
      }
      return level;
    });

    const updatedBatch = {
      ...currentBatch,
      levels: updatedLevels
    };

    setCurrentBatch(updatedBatch);
    setBatches(prev => prev.map(batch => batch.id === currentBatch.id ? updatedBatch : batch));
    
    toast({
      title: "تم ترقية الطالب بنجاح! 🎉",
      description: `${student.name} انتقل إلى ${updatedLevels[nextLevelIndex].name}`,
    });
  };

  const addLevel = (name: string, sessionsCount: number) => {
    if (!currentBatch) return;

    const newLevel: Level = {
      id: crypto.randomUUID(),
      name,
      sessionsCount,
      students: []
    };

    const updatedBatch = {
      ...currentBatch,
      levels: [...currentBatch.levels, newLevel]
    };

    setCurrentBatch(updatedBatch);
    setBatches(prev => prev.map(batch => batch.id === currentBatch.id ? updatedBatch : batch));
    
    toast({
      title: "تم إضافة المستوى بنجاح",
      description: name,
    });
  };

  return {
    batches,
    currentBatch,
    setCurrentBatch,
    createBatch,
    addStudent,
    updateStudentPoints,
    promoteStudent,
    addLevel
  };
}