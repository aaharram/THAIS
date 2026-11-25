import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Save, X, Edit } from "lucide-react";

interface UnsavedChangesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinueEditing: () => void;
    onDiscardChanges: () => void;
    onSaveChanges?: () => void;
}

export function UnsavedChangesDialog({
                                         open,
                                         onOpenChange,
                                         onContinueEditing,
                                         onDiscardChanges,
                                         onSaveChanges,
                                     }: UnsavedChangesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-fit p-6 rounded-lg shadow-xl">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Modifications non enregistrées
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                        Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onContinueEditing}
                        className="w-full gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Continuer l'édition
                    </Button>

                    {onSaveChanges && (
                        <Button
                            onClick={onSaveChanges}
                            className="w-full gap-2 bg-primary"
                        >
                            <Save className="w-4 h-4" />
                            Sauvegarder
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        onClick={onDiscardChanges}
                        className="w-full gap-2"
                    >
                        <X className="w-4 h-4" />
                        Annuler les modifications
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}