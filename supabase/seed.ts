/**
 * ImmerseTrain Database Seed
 * Run: npx ts-node supabase/seed.ts
 *
 * Prerequisites:
 *   - .env.local must have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY filled in
 *   - supabase/schema.sql must have been run in the Supabase SQL editor
 */

import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || supabaseUrl.includes('REPLACE_ME')) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}
if (!supabaseServiceKey || supabaseServiceKey.includes('REPLACE_ME')) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱  Seeding ImmerseTrain database...\n');

  // ── Scenario ──
  const { data: scenario, error: sErr } = await supabase
    .from('scenarios')
    .insert({
      title: 'Handling a Difficult Customer at the Fare Gate',
      description:
        'You are a station agent at a busy NYC subway station. A customer approaches your booth frustrated about a MetroCard issue. Navigate this interaction professionally.',
      video_url:
        process.env.NEXT_PUBLIC_VIDEO_URL ||
        'https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.mp4',
      thumbnail_url:
        'https://images.unsplash.com/photo-1569168075631-7f0deb06e879?w=800&q=80',
      duration_seconds: 180,
      published: true,
    })
    .select('id')
    .single();

  if (sErr) {
    console.error('❌  Failed to insert scenario:', sErr.message);
    process.exit(1);
  }

  console.log(`✅  Scenario created: ${scenario.id}`);

  // ── Questions ──
  const questions = [
    {
      sort_order: 1, timestamp_seconds: 15,
      question_text: "A customer runs up to you shouting 'My MetroCard didn't work and I missed my train! Fix it NOW!' What do you do first?",
      option_a: "Tell them to calm down and lower their voice before you help them.",
      option_b: "Acknowledge their frustration calmly: 'I understand, let me look into that right away.'",
      correct_option: 'b',
      explanation: "De-escalation always starts with acknowledgment, not correction. Telling someone to 'calm down' typically increases tension.",
      points: 10,
    },
    {
      sort_order: 2, timestamp_seconds: 32,
      question_text: "The customer hands you their MetroCard. Your reader shows it has a $0 balance. The customer insists they just loaded $20. What do you do?",
      option_a: "Tell them 'The card shows $0, there's nothing I can do. They need to call 511.'",
      option_b: "Say 'I can see your balance shows $0 right now. Let me check if there's a pending transaction and give you the MTA refund process.'",
      correct_option: 'b',
      explanation: "Never leave a customer with no path forward. Referring to 511 without context feels dismissive.",
      points: 10,
    },
    {
      sort_order: 3, timestamp_seconds: 50,
      question_text: "A customer in a wheelchair says the elevator to the platform is broken. They're going to be late for a medical appointment. What is your priority action?",
      option_a: "Apologize and give them the MTA accessibility hotline number.",
      option_b: "Immediately radio the situation to your supervisor, offer to call ADA assistance, and tell the customer you are actively working on getting them help.",
      correct_option: 'b',
      explanation: "Accessibility situations require immediate escalation. ADA compliance means you must take action, not just document.",
      points: 10,
    },
    {
      sort_order: 4, timestamp_seconds: 68,
      question_text: "A customer says they found a backpack left unattended on the platform for over 20 minutes. How do you respond?",
      option_a: "Thank them, radio it in as a suspicious package per MTA protocol, and ask the customer to move away from the area.",
      option_b: "Go check the bag yourself to see if it's really suspicious before calling it in.",
      correct_option: 'a',
      explanation: "MTA policy is clear: never approach or inspect unattended packages. Radio immediately and follow protocol.",
      points: 10,
    },
    {
      sort_order: 5, timestamp_seconds: 85,
      question_text: "A tourist asks you which train goes to JFK airport. There is a long line of other customers behind them. What do you do?",
      option_a: "Quickly say 'Take the A train' and wave them toward the platform.",
      option_b: "Give them accurate directions: 'Take the A train to Howard Beach, then the AirTrain to JFK. Takes about 60 minutes. You'll need a separate AirTrain ticket.'",
      correct_option: 'b',
      explanation: "Speed that causes a customer to board the wrong train wastes more time than 15 extra seconds of correct information.",
      points: 10,
    },
    {
      sort_order: 6, timestamp_seconds: 102,
      question_text: "A visibly intoxicated person is sitting on the platform floor, bothering other passengers. They are not being violent. What is the correct response?",
      option_a: "Announce over the PA system that they must leave or police will be called.",
      option_b: "Approach calmly from a safe distance, assess their condition, radio for assistance, and if they are unresponsive or ill, call for medical help immediately.",
      correct_option: 'b',
      explanation: "Public announcements escalate situations. Assessment and proper escalation through channels is the protocol.",
      points: 10,
    },
    {
      sort_order: 7, timestamp_seconds: 118,
      question_text: "A customer is filming you with their phone during a heated argument about a fare dispute. How do you respond?",
      option_a: "Ask them to stop filming and threaten to end the conversation if they don't.",
      option_b: "Continue to assist them professionally. Members of the public have the right to film in public spaces.",
      correct_option: 'b',
      explanation: "Demanding someone stop filming often escalates the situation dramatically. MTA employees must maintain consistent professional conduct.",
      points: 10,
    },
    {
      sort_order: 8, timestamp_seconds: 135,
      question_text: "A child, approximately 7 years old, is standing alone on the platform crying. They say they can't find their parent. What is your immediate first action?",
      option_a: "Make a PA announcement asking the parent to come to your booth.",
      option_b: "Bring the child to a safe, visible area near your booth, radio for assistance, and stay with the child while looking for the parent. Do not leave the child alone.",
      correct_option: 'b',
      explanation: "Child safety is paramount. The child must never be left alone. Physical safety comes first.",
      points: 10,
    },
    {
      sort_order: 9, timestamp_seconds: 152,
      question_text: "During rush hour, an overcrowded platform situation is developing. Passengers are dangerously close to the edge. What do you do?",
      option_a: "Wait to see if the next train resolves the crowding before escalating.",
      option_b: "Immediately radio the situation to your supervisor and the train operator, make a PA announcement asking customers to move back from the platform edge.",
      correct_option: 'b',
      explanation: "Platform overcrowding is a life-safety situation requiring immediate action. Waiting is never acceptable.",
      points: 10,
    },
    {
      sort_order: 10, timestamp_seconds: 168,
      question_text: "Your shift ends in 5 minutes and there is still a long line of customers. Your relief has not arrived. What do you do?",
      option_a: "Close your window at shift end time, leave a note, and exit.",
      option_b: "Stay at your post, radio your supervisor immediately to report the no-show, and continue serving customers until officially relieved.",
      correct_option: 'b',
      explanation: "MTA protocol requires you to remain on duty until officially relieved. You may never abandon your post.",
      points: 10,
    },
  ].map(q => ({ ...q, scenario_id: scenario.id }));

  const { error: qErr } = await supabase.from('questions').insert(questions);
  if (qErr) {
    console.error('❌  Failed to insert questions:', qErr.message);
    process.exit(1);
  }

  console.log(`✅  10 questions seeded`);
  console.log('\n🎉  Seed complete! Your database is ready.\n');
  console.log(`   Scenario ID: ${scenario.id}`);
  console.log(`   Test it at: http://localhost:3000/train/${scenario.id}\n`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
