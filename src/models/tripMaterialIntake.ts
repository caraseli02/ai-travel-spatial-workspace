import type { InboxItem } from '../data/tripData';

export function buildInboxItem(content: string, now = Date.now): InboxItem {
  let type: InboxItem['type'] = 'note';
  let source = 'Inbox Clip';
  let avatar: string | undefined = undefined;

  const lower = content.toLowerCase();
  if (lower.includes('flight') || lower.includes('jl') || lower.includes('ana') || lower.includes('sfo-') || lower.includes('kix')) {
    type = 'flight';
    source = 'Flight Parser';
  } else if (lower.includes('hotel') || lower.includes('ryokan') || lower.includes('booking') || lower.includes('stay') || lower.includes('airbnb') || lower.includes('hoshinoya') || lower.includes('hostel')) {
    type = 'hotel';
    source = 'Hotel Scanner';
  } else if (lower.includes('http') || lower.includes('.com') || lower.includes('reddit') || lower.includes('eater') || lower.includes('blog')) {
    type = 'link';
    source = 'Web Parser';
  } else if (lower.includes('chat') || lower.includes('says') || lower.includes(':') || lower.includes('mom') || lower.includes('yuki') || lower.includes('friend')) {
    type = 'whatsapp';
    source = 'WhatsApp Sync';
    avatar = '💬';
  }

  return {
    id: `i_spawn_${now()}`,
    type,
    source,
    content,
    timestamp: 'Just now',
    processed: false,
    avatar,
  };
}
