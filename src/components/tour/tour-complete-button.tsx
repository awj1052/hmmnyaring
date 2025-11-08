'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TourCompleteButtonProps = {
  requestId: string;
};

/**
 * 투어 완료 처리 버튼 (가이드 전용)
 */
export function TourCompleteButton({ requestId }: TourCompleteButtonProps) {
  const router = useRouter();
  const t = useTranslations('tour');
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);

  const completeMutation = useMutation(
    trpc.tourRequest.complete.mutationOptions()
  );

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync({ requestId });
      toast.success(t('completedSuccess'));
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(t('completedError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CheckCircle className="mr-2 h-4 w-4" />
          {t('completeTour')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('completeTourTitle')}</DialogTitle>
          <DialogDescription>
            {t('completeTourDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending ? t('processing') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

