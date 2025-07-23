import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BookOpen, UserPlus, TrendingUp } from "lucide-react";
import { Level, Student } from "@/types/app";
import { StudentCard } from "./StudentCard";

interface LevelViewProps {
  levels: Level[];
  onAddStudent: (levelId: string, student: Omit<Student, 'id' | 'levelId' | 'points'>) => void;
  onUpdatePoints: (studentId: string, points: number) => void;
  onPromoteStudent: (studentId: string) => void;
  onAddLevel: (name: string, sessionsCount: number) => void;
}

export function LevelView({ levels, onAddStudent, onUpdatePoints, onPromoteStudent, onAddLevel }: LevelViewProps) {
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [levelName, setLevelName] = useState("");
  const [sessionsCount, setSessionsCount] = useState("4");

  const handleAddStudent = () => {
    if (studentName.trim() && studentPhone.trim() && selectedLevelId) {
      onAddStudent(selectedLevelId, {
        name: studentName.trim(),
        phone: studentPhone.trim()
      });
      setStudentName("");
      setStudentPhone("");
      setIsStudentDialogOpen(false);
    }
  };

  const handleAddLevel = () => {
    if (levelName.trim() && sessionsCount.trim()) {
      onAddLevel(levelName.trim(), parseInt(sessionsCount));
      setLevelName("");
      setSessionsCount("4");
      setIsLevelDialogOpen(false);
    }
  };

  const openStudentDialog = (levelId: string) => {
    setSelectedLevelId(levelId);
    setIsStudentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">مستويات طلاب Knowledge</h2>
        <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-secondary text-secondary-foreground hover:bg-secondary/80">
              <Plus className="w-4 h-4 ml-1" />
              إضافة مستوى
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center">إضافة مستوى جديد</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="levelName">اسم المستوى</Label>
                <Input
                  id="levelName"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  placeholder="مثال: المستوى المتقدم"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="sessionsCount">عدد الجلسات</Label>
                <Input
                  id="sessionsCount"
                  type="number"
                  value={sessionsCount}
                  onChange={(e) => setSessionsCount(e.target.value)}
                  placeholder="4"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleAddLevel}
                className="w-full bg-gradient-primary hover:bg-primary-hover"
                disabled={!levelName.trim() || !sessionsCount.trim()}
              >
                إضافة المستوى
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {levels.length === 0 ? (
        <Card className="bg-gradient-card shadow-arabic-md">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد مستويات</h3>
            <p className="text-muted-foreground">ابدأ بإضافة أول مستوى</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {levels.map((level, index) => (
            <Card key={level.id} className="bg-gradient-card shadow-arabic-md animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">{level.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{level.sessionsCount} جلسة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{level.students.length} طالب</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {level.students.some(s => s.points >= 20) && (
                      <Badge className="bg-creative/20 text-creative animate-bounce-gentle">
                        <TrendingUp className="w-3 h-3 ml-1" />
                        جاهز للترقية
                      </Badge>
                    )}
                    <Button
                      onClick={() => openStudentDialog(level.id)}
                      size="sm"
                      className="bg-gradient-primary hover:bg-primary-hover"
                    >
                      <UserPlus className="w-4 h-4 ml-1" />
                      إضافة طالب
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {level.students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا يوجد طلاب Knowledge في هذا المستوى</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {level.students.map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onUpdatePoints={onUpdatePoints}
                        onPromote={onPromoteStudent}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">إضافة طالب جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="studentName">اسم الطالب</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="أدخل اسم الطالب"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="studentPhone">رقم الجوال</Label>
              <Input
                id="studentPhone"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="mt-1"
              />
            </div>
            
            <Button
              onClick={handleAddStudent}
              className="w-full bg-gradient-primary hover:bg-primary-hover"
              disabled={!studentName.trim() || !studentPhone.trim()}
            >
              إضافة الطالب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}