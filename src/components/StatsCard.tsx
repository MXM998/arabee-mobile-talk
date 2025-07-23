import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Award, Star } from "lucide-react";
import { Batch } from "@/types/app";

interface StatsCardProps {
  batch: Batch;
}

export function StatsCard({ batch }: StatsCardProps) {
  const totalStudents = batch.levels.reduce((total, level) => total + level.students.length, 0);
  const totalPoints = batch.levels.reduce((total, level) => 
    total + level.students.reduce((levelTotal, student) => levelTotal + student.points, 0), 0
  );
  const studentsReadyToPromote = batch.levels.reduce((total, level) => 
    total + level.students.filter(student => student.points >= 20).length, 0
  );
  
  const averagePoints = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Card className="bg-gradient-card shadow-arabic-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full mx-auto mb-2">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
          <div className="text-xs text-muted-foreground">إجمالي طلاب Knowledge</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-arabic-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-creative/10 rounded-full mx-auto mb-2">
            <Star className="w-4 h-4 text-creative" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
          <div className="text-xs text-muted-foreground">إجمالي النقاط</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-arabic-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-success/10 rounded-full mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground">{averagePoints}</div>
          <div className="text-xs text-muted-foreground">متوسط النقاط</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-arabic-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded-full mx-auto mb-2">
            <Award className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-foreground">{studentsReadyToPromote}</div>
          <div className="text-xs text-muted-foreground">جاهز للترقية</div>
        </CardContent>
      </Card>
    </div>
  );
}