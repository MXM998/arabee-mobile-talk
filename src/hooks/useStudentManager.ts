import { useState, useEffect } from 'react';
import { Student, Level, Batch } from '@/types/app';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/database';

export function useStudentManager() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize database and load data
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        const loadedBatches = await databaseService.getAllBatches();
        setBatches(loadedBatches);
        
        // Set first batch as current if available
        if (loadedBatches.length > 0) {
          setCurrentBatch(loadedBatches[0]);
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        toast({
          title: "خطأ في قاعدة البيانات",
          description: "فشل في تحميل البيانات",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Current batch state management (no localStorage needed)

  const createBatch = async (name: string, number: number) => {
    try {
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

      await databaseService.createBatch(newBatch);
      setBatches(prev => [...prev, newBatch]);
      setCurrentBatch(newBatch);
      
      toast({
        title: "تم إنشاء الدفعة بنجاح",
        description: `دفعة ${name} - رقم ${number}`,
      });

      return newBatch;
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الدفعة",
        variant: "destructive"
      });
    }
  };

  const addStudent = async (levelId: string, student: Omit<Student, 'id' | 'levelId' | 'points'>) => {
    if (!currentBatch) return;

    try {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        ...student,
        levelId,
        points: 0
      };

      await databaseService.addStudent(newStudent);

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
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الطالب",
        variant: "destructive"
      });
    }
  };

  const updateStudentPoints = async (studentId: string, pointsToAdd: number) => {
    if (!currentBatch) return;

    try {
      const student = currentBatch.levels
        .flatMap(level => level.students)
        .find(s => s.id === studentId);
      
      if (!student) return;

      const newPoints = student.points + pointsToAdd;
      await databaseService.updateStudentPoints(studentId, newPoints);

      const updatedBatch = {
        ...currentBatch,
        levels: currentBatch.levels.map(level => ({
          ...level,
          students: level.students.map(student =>
            student.id === studentId
              ? { ...student, points: newPoints }
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
    } catch (error) {
      console.error('Error updating student points:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث النقاط",
        variant: "destructive"
      });
    }
  };

  const promoteStudent = async (studentId: string) => {
    if (!currentBatch) return;

    try {
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

      // Update database
      await databaseService.updateBatch(updatedBatch);

      setCurrentBatch(updatedBatch);
      setBatches(prev => prev.map(batch => batch.id === currentBatch.id ? updatedBatch : batch));
      
      toast({
        title: "تم ترقية الطالب بنجاح! 🎉",
        description: `${student.name} انتقل إلى ${updatedLevels[nextLevelIndex].name}`,
      });
    } catch (error) {
      console.error('Error promoting student:', error);
      toast({
        title: "خطأ",
        description: "فشل في ترقية الطالب",
        variant: "destructive"
      });
    }
  };

  const addLevel = async (name: string, sessionsCount: number) => {
    if (!currentBatch) return;

    try {
      const newLevel: Level = {
        id: crypto.randomUUID(),
        name,
        sessionsCount,
        students: []
      };

      await databaseService.addLevel(newLevel, currentBatch.id);

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
    } catch (error) {
      console.error('Error adding level:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المستوى",
        variant: "destructive"
      });
    }
  };

  return {
    batches,
    currentBatch,
    setCurrentBatch,
    createBatch,
    addStudent,
    updateStudentPoints,
    promoteStudent,
    addLevel,
    isLoading
  };
}