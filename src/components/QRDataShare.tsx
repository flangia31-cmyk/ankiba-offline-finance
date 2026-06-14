import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, QrCode, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import { exportData, importData, getCurrency, setCurrency } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const SCANNER_ID = "ankiba-qr-reader";

export function QRDataShare() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [tooLarge, setTooLarge] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Build the payload (financial data + currency) and generate the QR code
  const generateQR = async () => {
    setQrUrl(null);
    setTooLarge(false);
    const payload = JSON.stringify({
      data: JSON.parse(exportData()),
      currency: getCurrency(),
    });
    const compressed = compressToEncodedURIComponent(payload);

    // QR codes have a practical capacity limit; warn if the data is too large
    if (compressed.length > 2200) {
      setTooLarge(true);
      return;
    }

    try {
      const url = await QRCode.toDataURL(compressed, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 320,
      });
      setQrUrl(url);
    } catch {
      setTooLarge(true);
    }
  };

  const applyScannedData = (decodedText: string): boolean => {
    try {
      const decompressed = decompressFromEncodedURIComponent(decodedText);
      if (!decompressed) return false;
      const parsed = JSON.parse(decompressed);
      const ok = importData(JSON.stringify(parsed.data));
      if (!ok) return false;
      if (parsed.currency) setCurrency(parsed.currency);
      return true;
    } catch {
      return false;
    }
  };

  const startScan = async () => {
    setScanError(null);
    setScanning(true);
    // Wait for the scanner container to mount
    await new Promise((r) => setTimeout(r, 50));
    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await stopScan();
          const success = applyScannedData(decodedText);
          if (success) {
            toast({
              title: "Données importées",
              description: "Les données ont été récupérées avec succès.",
            });
            setOpen(false);
            window.location.reload();
          } else {
            toast({
              title: "QR code invalide",
              description: "Ce QR code ne contient pas de données Ankiba valides.",
              variant: "destructive",
            });
          }
        },
        () => {}
      );
    } catch {
      setScanError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
      setScanning(false);
    }
  };

  const stopScan = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Cleanup when dialog closes or component unmounts
  useEffect(() => {
    if (!open) {
      stopScan();
      setQrUrl(null);
      setTooLarge(false);
      setScanError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      stopScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Partager via QR code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partage entre appareils</DialogTitle>
          <DialogDescription>
            Transférez vos données d'un appareil à un autre via un QR code, sans Internet.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="send"
          onValueChange={(v) => {
            stopScan();
            if (v === "send") generateQR();
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send" onClick={() => generateQR()}>
              <QrCode className="w-4 h-4 mr-2" />
              Envoyer
            </TabsTrigger>
            <TabsTrigger value="receive">
              <Camera className="w-4 h-4 mr-2" />
              Recevoir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Scannez ce QR code depuis l'autre appareil (onglet « Recevoir »).
            </p>
            <Card className="p-4 flex items-center justify-center bg-white">
              {tooLarge ? (
                <div className="text-center space-y-2 py-8 text-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
                  <p className="text-sm">
                    Vos données sont trop volumineuses pour un QR code. Utilisez plutôt
                    l'export par fichier.
                  </p>
                </div>
              ) : qrUrl ? (
                <img src={qrUrl} alt="QR code de partage des données" className="w-64 h-64" />
              ) : (
                <div className="py-24 text-sm text-muted-foreground">Génération…</div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pointez la caméra vers le QR code affiché sur l'autre appareil.
            </p>
            {scanError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {scanError}
              </div>
            )}
            <div id={SCANNER_ID} className="overflow-hidden rounded-lg" />
            {!scanning ? (
              <Button className="w-full" onClick={startScan}>
                <Camera className="w-4 h-4 mr-2" />
                Démarrer le scan
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={stopScan}>
                Arrêter
              </Button>
            )}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              Les données reçues remplaceront celles de cet appareil.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
