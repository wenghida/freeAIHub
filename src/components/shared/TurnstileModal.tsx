"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TurnstileModalProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TurnstileModalRef {
  reset: () => void;
}

const TurnstileModal = forwardRef<TurnstileModalRef, TurnstileModalProps>(
  ({ siteKey, onSuccess, onError, onExpire, open, onOpenChange }, ref) => {
    const turnstileRef = useRef<{ reset: () => void }>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      },
    }));

    const handleSuccess = (token: string) => {
      onSuccess(token);
      onOpenChange(false);
    };

    const handleError = () => {
      onError?.();
      onOpenChange(false);
    };

    const handleExpire = () => {
      onExpire?.();
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Human Verification</DialogTitle>
            <DialogDescription>
              Please complete the verification to continue
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={handleSuccess}
              onError={handleError}
              onExpire={handleExpire}
              theme="light"
              size="normal"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

TurnstileModal.displayName = "TurnstileModal";

export default TurnstileModal;