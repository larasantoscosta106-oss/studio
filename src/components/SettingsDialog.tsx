"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";

const settingsSchema = z.object({
  bancaName: z.string().min(1, "Nome da banca é obrigatório"),
  commissionPeriod: z.coerce.number().min(0, "Deve ser >= 0").max(100, "Deve ser <= 100"),
  commissionGroup: z.coerce.number().min(0, "Deve ser >= 0").max(100, "Deve ser <= 100"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onOpenChange }) => {
  const { appState, updateSettings, selectedBanca } = useAppContext();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: appState.settings,
  });

  useEffect(() => {
    if(isOpen) {
        reset(appState.settings);
    }
  }, [isOpen, appState, reset, selectedBanca]);

  const onSubmit = (data: SettingsFormData) => {
    updateSettings(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Ajuste as configurações para a banca: <span className="font-bold text-primary">{appState.settings.bancaName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bancaName" className="text-right">Banca</Label>
              <Controller
                name="bancaName"
                control={control}
                render={({ field }) => <Input id="bancaName" {...field} className="col-span-3" />}
              />
              {errors.bancaName && <p className="col-span-4 text-destructive text-sm text-center">{errors.bancaName.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commissionPeriod" className="text-right">Comissão Períodos (%)</Label>
              <Controller
                name="commissionPeriod"
                control={control}
                render={({ field }) => <Input id="commissionPeriod" type="number" {...field} className="col-span-3" />}
              />
              {errors.commissionPeriod && <p className="col-span-4 text-destructive text-sm text-center">{errors.commissionPeriod.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commissionGroup" className="text-right">Comissão Grupos (%)</Label>
              <Controller
                name="commissionGroup"
                control={control}
                render={({ field }) => <Input id="commissionGroup" type="number" {...field} className="col-span-3" />}
              />
              {errors.commissionGroup && <p className="col-span-4 text-destructive text-sm text-center">{errors.commissionGroup.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
