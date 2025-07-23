import { BatchSelector } from "@/components/BatchSelector";
import { LevelView } from "@/components/LevelView";
import { StatsCard } from "@/components/StatsCard";
import { useStudentManager } from "@/hooks/useStudentManager";

const Index = () => {
  const {
    batches,
    currentBatch,
    setCurrentBatch,
    createBatch,
    addStudent,
    updateStudentPoints,
    promoteStudent,
    addLevel,
    isLoading
  } = useStudentManager();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {!currentBatch ? (
          <BatchSelector
            batches={batches}
            currentBatch={currentBatch}
            onSelectBatch={setCurrentBatch}
            onCreateBatch={createBatch}
          />
        ) : (
          <div className="space-y-6">
            <BatchSelector
              batches={batches}
              currentBatch={currentBatch}
              onSelectBatch={setCurrentBatch}
              onCreateBatch={createBatch}
            />
            
            <StatsCard batch={currentBatch} />
            
            <LevelView
              levels={currentBatch.levels}
              onAddStudent={addStudent}
              onUpdatePoints={updateStudentPoints}
              onPromoteStudent={promoteStudent}
              onAddLevel={addLevel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
