import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY manquant dans .env.local" }, { status: 500 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from:    "XI BestPlaze <noreply@bestplaze.fr>",
      to:      process.env.ADMIN_EMAIL ?? "test@example.com",
      subject: "✅ Test email — XI BestPlaze fonctionne",
      html:    "<p>Si tu reçois cet email, Resend est correctement configuré sur BestPlaze 🎉</p>",
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
