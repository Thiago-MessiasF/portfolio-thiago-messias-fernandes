import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const CHURCH_ID = 1;

export default function AdminChurch() {
  const utils = trpc.useUtils();
  const { data: church, isLoading } = trpc.churches.getById.useQuery({ id: CHURCH_ID });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [logoUrl, setLogoUrl] = useState("");


  useEffect(() => {
    if (church) {
      setName(church.name ?? "");
      setDescription(church.description ?? "");
      setAddress(church.address ?? "");
      setPhone(church.phone ?? "");
      setEmail(church.email ?? "");
      setWebsite(church.website ?? "");
      setPrimaryColor(church.primaryColor ?? "#7c3aed");
      setLogoUrl(church.logoUrl ?? "");

    }
  }, [church]);

  const update = trpc.churches.update.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas!");
      utils.churches.getById.invalidate({ id: CHURCH_ID });
    },
    onError: () => toast.error("Erro ao salvar configurações"),
  });

  return (
    <AdminLayout title="Configurações da Igreja">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="font-serif text-2xl font-light text-foreground">Configurações da Igreja</h2>
          <p className="text-sm text-muted-foreground">Personalize a identidade visual e informações da sua igreja</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Identidade Visual</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome da Igreja *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da sua igreja" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL do Logo</Label>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Cor Principal</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                    />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Sobre sua igreja..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Informações de Contato</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@igreja.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Endereço</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, cidade" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                </div>
              </CardContent>
            </Card>



            <Button
              onClick={() => update.mutate({
                id: CHURCH_ID,
                name,
                description: description || undefined,
                address: address || undefined,
                phone: phone || undefined,
                email: email || undefined,
                website: website || undefined,
                primaryColor,
                logoUrl: logoUrl || undefined,

              })}
              disabled={!name.trim() || update.isPending}
              className="gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              {update.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
