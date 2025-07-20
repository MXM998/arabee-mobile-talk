import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Star, Award, Plus } from "lucide-react";
import { Student } from "@/types/app";

interface StudentCardProps {
  student: Student;
  onUpdatePoints: (studentId: string, points: number) => void;
  onPromote?: (studentId: string) => void;
}

export function StudentCard({ student, onUpdatePoints, onPromote }: StudentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPoints = (points: number) => {
    onUpdatePoints(student.id, points);
    setIsDialogOpen(false);
    
    // Check if student should be promoted
    if (student.points + points >= 20 && onPromote) {
      setTimeout(() => {
        onPromote(student.id);
      }, 500);
    }
  };

  const canPromote = student.points >= 20;

  return (
    <Card className="p-4 bg-gradient-card shadow-arabic-md hover:shadow-arabic-lg transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{student.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{student.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="text-left">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-4 h-4 text-creative" />
            <span className="font-bold text-lg text-foreground">{student.points}</span>
            <span className="text-sm text-muted-foreground">نقطة</span>
          </div>
          {canPromote && (
            <Badge variant="secondary" className="bg-creative/20 text-creative animate-bounce-gentle">
              <Award className="w-3 h-3 ml-1" />
              جاهز للترقية
            </Badge>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-primary hover:bg-primary-hover transition-all duration-300" size="sm">
            <Plus className="w-4 h-4 ml-1" />
            إضافة نقاط
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">إضافة نقاط للطالب</DialogTitle>
            <p className="text-center text-muted-foreground">{student.name}</p>
          </DialogHeader>
          
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => handleAddPoints(7)}
              className="w-full bg-creative hover:bg-creative/90 text-white shadow-glow transition-all duration-300"
              size="lg"
            >
              <Award className="w-5 h-5 ml-2" />
              إنجاز مبدع - 7 نقاط
            </Button>
            
            <Button
              onClick={() => handleAddPoints(5)}
              className="w-full bg-success hover:bg-success/90 text-white transition-all duration-300"
              size="lg"
            >
              <Star className="w-5 h-5 ml-2" />
              إنجاز جيد - 5 نقاط
            </Button>
            
            <Button
              onClick={() => handleAddPoints(0)}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              لم ينجز الوظيفة - 0 نقاط
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}