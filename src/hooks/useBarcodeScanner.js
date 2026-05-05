import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';

export const useBarcodeScanner = ({ onDetected, scannerEnabled = true }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const lastScanTime = useRef(0);
  const isScanning = useRef(false);

  const initQuagga = useCallback(() => {
    const scannerElement = document.querySelector('#scanner');
    if (!scannerElement) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: 'environment',
            aspectRatio: { min: 1, max: 2 },
          },
          target: scannerElement,
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
          readers: ['ean_reader', 'upc_reader', 'ean_8_reader', 'upc_e_reader'],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error('Quagga init failed:', err);
          setError(err);
          setIsInitializing(false);
          return;
        }
        if (scannerEnabled) {
          Quagga.start();
          isScanning.current = true;
        }
        setIsInitializing(false);
      }
    );

    Quagga.onDetected((data) => {
      if (!data || !data.codeResult || !data.codeResult.code) return;

      const code = data.codeResult.code;
      const now = Date.now();

      // Debounce: ignore repeated scans for 2 seconds
      if (now - lastScanTime.current < 2000) return;

      lastScanTime.current = now;
      onDetected(code);
    });
  }, [onDetected, scannerEnabled]);

  useEffect(() => {
    if (scannerEnabled) {
      initQuagga();
    } else {
      if (isScanning.current) {
        Quagga.stop();
        isScanning.current = false;
      }
    }

    return () => {
      if (isScanning.current) {
        Quagga.stop();
        isScanning.current = false;
      }
      Quagga.offDetected();
    };
  }, [scannerEnabled, initQuagga]);

  return { isInitializing, error };
};
