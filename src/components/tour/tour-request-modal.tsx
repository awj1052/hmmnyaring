/**
 * 투어 요청 모달
 */

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TourCategory } from '@prisma/client';
import { useTranslations } from 'next-intl';

const getCategoryMap = (t: (key: string) => string): Record<TourCategory, string> => ({
  FOOD: t('category.food'),
  CAFE: t('category.cafe'),
  HISTORY: t('category.history'),
  NATURE: t('category.nature'),
  SHOPPING: t('category.shopping'),
  NIGHTLIFE: t('category.nightlife'),
});

type TourRequestModalProps = {
  guideId: string;
  guideName: string;
  children?: React.ReactNode;
};

export function TourRequestModal({ guideId, guideName, children }: TourRequestModalProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations();
  const tTour = useTranslations('tourRequest');

  const CATEGORY_MAP = getCategoryMap(t);

  const [open, setOpen] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<TourCategory | ''>('');
  const [isOnline, setIsOnline] = useState(false);

  const createMutation = useMutation(
    trpc.tourRequest.create.mutationOptions()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestedDate || !message || !category) {
      toast.error(tTour('fillAllFields'));
      return;
    }

    try {
      await createMutation.mutateAsync({
        guideId,
        requestedDate: new Date(requestedDate),
        message,
        category: category as TourCategory,
        isOnline,
      });

      toast.success(tTour('success'));
      setOpen(false);
      setRequestedDate('');
      setMessage('');
      setCategory('');
      setIsOnline(false);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error(tTour('failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="w-full">
            <Calendar className="mr-2 h-5 w-5" />
            {tTour('title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tTour('title')}</DialogTitle>
          <DialogDescription>{tTour('description', { name: guideName })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestedDate">{tTour('date')}</Label>
            <Input
              id="requestedDate"
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{tTour('category')}</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TourCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder={tTour('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_MAP).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isOnline">{tTour('type')}</Label>
            <Select value={isOnline ? 'online' : 'offline'} onValueChange={(value) => setIsOnline(value === 'online')}>
              <SelectTrigger id="isOnline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offline">{tTour('typeOffline')}</SelectItem>
                <SelectItem value="online">{tTour('typeOnline')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{tTour('message')}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={tTour('messagePlaceholder')}
              rows={4}
              minLength={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              {tTour('messageHint', { count: message.length })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              {tTour('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tTour('sending')}
                </>
              ) : (
                tTour('submit')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

