import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { type, subject } = req.body;

  // This fires when a user successfully pays
  if (type === "payment.completed") {
    const customerEmail = subject.customer.email;
    const packages = subject.products; // List of what they bought

    console.log(`SUCCESS: Delivering products to ${customerEmail}`);
    
    // TODO: Insert your logic here to:
    // 1. Send an email with the script
    // 2. Or add their ID to a "purchased" database
  }

  return res.status(200).json({ received: true });
}