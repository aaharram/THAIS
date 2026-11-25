import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Title } from '@/components/ui/title';
import { LookupRequest } from '@/store/features/configuration/lookup-schemas';
import { getLookupModuleConfig, lookupModules } from '@/store/features/configuration/lookupModules';
import { LookupState } from '@/store/features/configuration/lookupSliceFactory';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const GenericLookupForm = ({ details }: { details?: boolean }) => {
  const { module, id } = useParams<{ module: string; id?: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const userId = useAppSelector((s: RootState) => s.auth.auth?.id);

  const config = module ? getLookupModuleConfig(module) : undefined;
  const slice = config ? lookupModules[config.key] : undefined;
  const state = useAppSelector((s: RootState) =>
    config ? (s[config.key] as unknown as LookupState) : undefined,
  );
  const item = state?.item ?? null;

  const [formData, setFormData] = useState<LookupRequest>({
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
    designation: '',
    taux: null,
    accesComplet: false,
  });

  useEffect(() => {
    if (id && slice) {
      dispatch(slice.getById(Number(id)));
    }
  }, [id, dispatch, slice]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        designation: item.designation ?? '',
        taux: item.taux ?? null,
        accesComplet: item.accesComplet ?? false,
      });
    }
  }, [item, userId]);

  if (!config || !slice) {
    return (
      <Card>
        <CardContent className="p-6">Module de configuration inconnu.</CardContent>
      </Card>
    );
  }

  const backPath = `/configuration-globale/reference/${module}`;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.designation || formData.designation.trim() === '') {
      newErrors.designation = 'La désignation est requise.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (item) {
      await dispatch(slice.edit({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(slice.resetItem());
    } else {
      await dispatch(slice.create(formData)).unwrap();
    }

    navigate(backPath);
  };

  const confirmDelete = () => {
    if (item) {
      dispatch(slice.remove(item.numero));
      dispatch(slice.resetItem());
      navigate(backPath);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <Title
            title={
              changeToDetails
                ? `Détails "${formData.designation}"`
                : item
                ? `Modifier "${formData.designation}"`
                : `Ajouter — ${config.labelSingular}`
            }
          />
          {item && (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setChangeToDetails(!changeToDetails)}>
                {changeToDetails ? 'Modifier' : 'Détails'}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Supprimer
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="py-6 px-4 sm:px-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="designation">{config.designationLabel ?? 'Désignation'}</Label>
              <Input
                id="designation"
                type={config.inputType ?? 'text'}
                placeholder={`${config.designationLabel ?? 'Désignation'}...`}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                disabled={changeToDetails}
                className={errors.designation ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.designation && <p className="text-red-600 text-sm">{errors.designation}</p>}
            </div>

            {config.hasRate && (
              <div className="space-y-2">
                <Label htmlFor="taux">{config.rateLabel ?? 'Taux (%)'}</Label>
                <Input
                  id="taux"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Ex: 20.00"
                  value={formData.taux ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taux: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  disabled={changeToDetails}
                />
              </div>
            )}

            {config.hasFlag && (
              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  id="accesComplet"
                  checked={formData.accesComplet ?? false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, accesComplet: checked === true })
                  }
                  disabled={changeToDetails}
                />
                <Label htmlFor="accesComplet">{config.flagLabel ?? 'Actif'}</Label>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={() => navigate(backPath)}>
          Précédent
        </Button>
        {!changeToDetails && (
          <Button onClick={handleSubmit}>{item ? 'Mettre à jour' : 'Ajouter'}</Button>
        )}
      </CardFooter>

      <BaseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer "${formData.designation}" ?`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Supprimer
          </Button>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default GenericLookupForm;
