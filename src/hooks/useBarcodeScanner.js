import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';

export const useBarcodeScanner = ({ onDetected, scannerEnabled = true }) => {
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

      // Debounce: ignore repeated scans for 2 seconds
      if (now - lastScanTime.current < 2000) return;

      lastScanTime.current = now;
      
      // Haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      onDetected(code);
    };

    Quagga.onDetected(handleDetected);

    return () => {
      if (isInitialized.current) {
        Quagga.stop();
      }
      Quagga.offDetected(handleDetected);
      isInitialized.current = false;
      quaggaActive.current = false;
    };
  }, []); // Only run once on mount

  // Toggle start/stop based on scannerEnabled prop
  useEffect(() => {
    if (scannerEnabled) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [scannerEnabled, startScanner, stopScanner]);

  return { isInitializing, error };
};
