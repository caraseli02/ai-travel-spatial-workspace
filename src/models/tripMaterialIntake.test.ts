import { describe, expect, it } from 'vitest';
import { buildInboxItem } from './tripMaterialIntake';

const fixedNow = () => 1_774_200_000_000;

describe('Trip Material intake', () => {
  it('classifies flight Trip Material into an Inbox Item', () => {
    expect(buildInboxItem('ANA flight SFO-KIX JL69', fixedNow)).toMatchObject({
      id: 'i_spawn_1774200000000',
      type: 'flight',
      source: 'Flight Parser',
      content: 'ANA flight SFO-KIX JL69',
      timestamp: 'Just now',
      processed: false,
    });
  });

  it('classifies conversational Trip Material into an Inbox Item', () => {
    expect(buildInboxItem('Mom says: buy matcha kit-kats', fixedNow)).toMatchObject({
      type: 'whatsapp',
      source: 'WhatsApp Sync',
      avatar: '💬',
    });
  });
});
