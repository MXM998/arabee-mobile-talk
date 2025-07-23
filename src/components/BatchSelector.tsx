import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, ChevronLeft } from "lucide-react";
import { Batch } from "@/types/app";

interface BatchSelectorProps {
  batches: Batch[];
  currentBatch: Batch | null;
  onSelectBatch: (batch: Batch) => void;
  onCreateBatch: (name: string, number: number) => void;
}

export function BatchSelector({ batches, currentBatch, onSelectBatch, onCreateBatch }: BatchSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  const handleCreateBatch = () => {
    if (batchName.trim() && batchNumber.trim()) {
      onCreateBatch(batchName.trim(), parseInt(batchNumber));
      setBatchName("");
      setBatchNumber("");
      setIsDialogOpen(false);
    }
  };

  const getTotalStudents = (batch: Batch) => {
    return batch.levels.reduce((total, level) => total + level.students.length, 0);
  };

  if (currentBatch) {
    return (
      <div className="mb-6">
        <Card className="bg-gradient-hero text-white shadow-arabic-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentBatch.name}</h2>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{getTotalStudents(currentBatch)} طالب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>دفعة رقم {currentBatch.number}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => onSelectBatch(null as any)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ChevronLeft className="w-4 h-4 ml-1" />
                تغيير الدفعة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">إدارة طلاب Knowledge MXM</h1>
        <p className="text-muted-foreground">اختر دفعة أو قم بإنشاء دفعة جديدة</p>
      </div>

      <div className="grid gap-4">
        {batches.length === 0 ? (
          <Card className="bg-gradient-card shadow-arabic-md">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <Users className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد دفعات حتى الآن</h3>
              <p className="text-muted-foreground mb-4">ابدأ بإنشاء أول دفعة لك</p>
            </CardContent>
          </Card>
        ) : (
          batches.map((batch) => (
            <Card
              key={batch.id}
              className="bg-gradient-card shadow-arabic-md hover:shadow-arabic-lg transition-all duration-300 cursor-pointer animate-fade-in"
              onClick={() => onSelectBatch(batch)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{batch.name}</h3>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{getTotalStudents(batch)} طالب</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>دفعة رقم {batch.number}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant="secondary" className="mb-2">
                      {batch.levels.length} مستوى
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-primary hover:bg-primary-hover shadow-arabic-md transition-all duration-300" size="lg">
            <Plus className="w-5 h-5 ml-2" />
            إنشاء دفعة جديدة
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">إنشاء دفعة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="batchName">اسم الدفعة</Label>
              <Input
                id="batchName"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="مثال: دفعة الربيع"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="batchNumber">رقم الدفعة</Label>
              <Input
                id="batchNumber"
                type="number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="مثال: 1"
                className="mt-1"
              />
            </div>
            
            <Button
              onClick={handleCreateBatch}
              className="w-full bg-gradient-primary hover:bg-primary-hover"
              disabled={!batchName.trim() || !batchNumber.trim()}
            >
              إنشاء الدفعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}