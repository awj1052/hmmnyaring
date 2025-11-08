/**
 * 투어 요청 액션 컴포넌트 (수락/거절)
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type TourRequestActionsProps = {
  requestId: string;
};

export function TourRequestActions({ requestId }: TourRequestActionsProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const acceptMutation = useMutation(
    trpc.tourRequest.accept.mutationOptions()
  );

  const rejectMutation = useMutation(
    trpc.tourRequest.reject.mutationOptions()
  );

  const handleAccept = async () => {
    try {
      const data = await acceptMutation.mutateAsync({ requestId });
      toast.success('투어 요청을 수락했습니다!');
      router.refresh();
      // 채팅방으로 리다이렉트
      if (data.chatRoom) {
        router.push(`/chat/${data.chatRoom.id}`);
      }
    } catch (error) {
      toast.error('수락에 실패했습니다.');
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ requestId });
      toast.success('투어 요청을 거절했습니다.');
      router.refresh();
    } catch (error) {
      toast.error('거절에 실패했습니다.');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleAccept}
        disabled={acceptMutation.isPending || rejectMutation.isPending}
      >
        {acceptMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Check className="mr-1 h-4 w-4" />
            수락
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={acceptMutation.isPending || rejectMutation.isPending}
      >
        {rejectMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <X className="mr-1 h-4 w-4" />
            거절
          </>
        )}
      </Button>
    </div>
  );
}

