import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, CheckCircle, CreditCard, Heart, QrCode, Banknote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CHURCH_ID = 1;

const AMOUNTS = [10, 20, 50, 100, 200];
const METHODS = [
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "cartao", label: "Cartão", icon: CreditCard },
  { value: "boleto", label: "Boleto", icon: Banknote },
];

export default function Donations() {
  const { user, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<"pix" | "cartao" | "boleto" | "transferencia">("pix");
  const [donorName, setDonorName] = useState(user?.name ?? "");
  const [donorEmail, setDonorEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: stats } = trpc.donations.stats.useQuery({ churchId: CHURCH_ID });

  const createDonation = trpc.donations.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Doação registrada com gratidão!");
    },
    onError: () => toast.error("Erro ao processar doação"),
  });

  const finalAmount = amount ?? (customAmount ? parseFloat(customAmount) : 0);

  const handleSubmit = () => {
    if (!finalAmount || finalAmount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    createDonation.mutate({
      churchId: CHURCH_ID,
      amount: finalAmount,
      method,
      donorName: isAnonymous ? undefined : (donorName || undefined),
      donorEmail: isAnonymous ? undefined : (donorEmail || undefined),
      message: message || undefined,
      isAnonymous,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl font-light text-foreground mb-2">Obrigado!</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Sua doação de <strong>R$ {finalAmount.toFixed(2)}</strong> foi registrada com sucesso.
            Que Deus abençoe sua generosidade!
          </p>
          <Button onClick={() => setSuccess(false)}>Fazer outra doação</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 to-slate-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-6 w-6 text-amber-300" />
            <span className="text-amber-300 text-sm font-medium uppercase tracking-wide">Contribua</span>
          </div>
          <h1 className="font-serif text-4xl font-light">Dízimos e Ofertas</h1>
          <p className="text-white/60 mt-2">Sua contribuição fortalece o ministério</p>

          {stats && (
            <div className="flex flex-wrap gap-6 mt-8">
              <div>
                <div className="text-2xl font-serif font-semibold">
                  R$ {parseFloat(String(stats.total ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-white/50 text-xs mt-0.5">Total arrecadado</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold">{stats.count ?? 0}</div>
                <div className="text-white/50 text-xs mt-0.5">Contribuições</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container py-10 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl font-light">Fazer uma Contribuição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount selection */}
            <div>
              <Label className="mb-3 block">Valor</Label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      amount === a
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    R${a}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Outro valor (R$)"
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                className="text-center"
              />
            </div>

            {/* Payment method */}
            <div>
              <Label className="mb-3 block">Forma de pagamento</Label>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value as typeof method)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-sm font-medium transition-all ${
                      method === m.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <m.icon className="h-5 w-5" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Donor info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="anon" className="cursor-pointer">Doação anônima</Label>
              </div>

              {!isAnonymous && (
                <>
                  <div className="space-y-1.5">
                    <Label>Nome</Label>
                    <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Seu nome" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="seu@email.com" type="email" />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label>Mensagem (opcional)</Label>
                <Textarea
                  placeholder="Deixe uma mensagem de gratidão..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Summary */}
            {finalAmount > 0 && (
              <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-semibold">R$ {finalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Método</span>
                  <span>{METHODS.find(m => m.value === method)?.label}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!finalAmount || finalAmount <= 0 || createDonation.isPending}
              className="w-full gap-2"
              size="lg"
            >
              <BookOpen className="h-5 w-5" />
              {createDonation.isPending ? "Processando..." : `Contribuir R$ ${finalAmount > 0 ? finalAmount.toFixed(2) : "0,00"}`}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Sua contribuição é um ato de fé e generosidade. Obrigado!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
