import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';

export const useBarcodeScanner = ({ onDetected, scannerEnabled = true, facingMode = 'environment' }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const lastScanTime = useRef(0);
  const isInitialized = useRef(false);
  const quaggaActive = useRef(false);

  const startScanner = useCallback(() => {
    if (isInitialized.current && !quaggaActive.current) {
      Quagga.start();
      quaggaActive.current = true;
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (isInitialized.current && quaggaActive.current) {
      Quagga.stop();
      quaggaActive.current = false;
    }
  }, []);

  useEffect(() => {
    const scannerElement = document.querySelector('#scanner');
    if (!scannerElement) return;

    setIsInitializing(true);

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: facingMode, // Dynamic facing mode
            aspectRatio: { min: 1, max: 2 },
          },
          target: scannerElement,
        },
        locator: { patchSize: 'medium', halfSample: true },
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
        isInitialized.current = true;
        if (scannerEnabled) {
          Quagga.start();
          quaggaActive.current = true;
        }
        setIsInitializing(false);
      }
    );

    const handleDetected = (data) => {
      if (!data || !data.codeResult || !data.codeResult.code) return;

      const code = data.codeResult.code;
      const now = Date.now();

      if (now - lastScanTime.current < 2000) return;
      lastScanTime.current = now;
      
      onDetected(code);
    };

    Quagga.onDetected(handleDetected);

    return () => {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
      isInitialized.current = false;
      quaggaActive.current = false;
    };
  }, [facingMode]); // Re-init on camera switch

  useEffect(() => {
    if (scannerEnabled) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [scannerEnabled, startScanner, stopScanner]);

  return { isInitializing, error };
};
