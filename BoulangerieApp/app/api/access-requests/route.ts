import { NextResponse } from "next/server";
import { getNeonClient } from "@/lib/db/neon";

type AccessRequestPayload = Record<string, unknown>;

function textField(payload: AccessRequestPayload, key: string) {
  return typeof payload[key] === "string" ? payload[key].trim() : "";
}

export async function POST(request: Request) {
  let payload: AccessRequestPayload;

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Formulaire invalide." },
        { status: 400 },
      );
    }
    payload = body as AccessRequestPayload;
  } catch {
    return NextResponse.json(
      { error: "Formulaire invalide." },
      { status: 400 },
    );
  }

  if (textField(payload, "website")) {
    return NextResponse.json(
      { message: "Votre demande a bien été envoyée." },
      { status: 201 },
    );
  }

  const contactName = textField(payload, "contact_name");
  const bakeryName = textField(payload, "bakery_name");
  const city = textField(payload, "city");
  const phone = textField(payload, "phone");
  const email = textField(payload, "email").toLowerCase();
  const needs = textField(payload, "needs");
  const preferredDemoDate = textField(payload, "preferred_demo_date");
  const preferredContact = textField(payload, "preferred_contact");
  const outletCount = Number(payload.outlet_count);
  const requestedPlan = textField(payload, "requested_plan");
  const parsedPreferredDemoDate = preferredDemoDate
    ? new Date(`${preferredDemoDate}T00:00:00.000Z`)
    : null;
  const today = new Date().toISOString().slice(0, 10);

  if (
    contactName.length < 2 ||
    contactName.length > 120 ||
    bakeryName.length < 2 ||
    bakeryName.length > 160 ||
    city.length < 2 ||
    city.length > 120 ||
    phone.length < 8 ||
    phone.length > 32 ||
    phone.replace(/\D/g, "").length < 8 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !Number.isInteger(outletCount) ||
    outletCount < 1 ||
    outletCount > 500 ||
    needs.length < 8 ||
    needs.length > 1500 ||
    (preferredDemoDate &&
      (Number.isNaN(parsedPreferredDemoDate?.getTime()) ||
        parsedPreferredDemoDate?.toISOString().slice(0, 10) !==
          preferredDemoDate ||
        preferredDemoDate < today)) ||
    (preferredContact &&
      !["whatsapp", "call", "email"].includes(preferredContact)) ||
    (requestedPlan && !["starter", "pro", "enterprise"].includes(requestedPlan))
  ) {
    return NextResponse.json(
      { error: "Vérifiez les champs du formulaire." },
      { status: 400 },
    );
  }

  const sql = getNeonClient();

  if (!sql) {
    return NextResponse.json(
      {
        error: "Le formulaire n’est pas encore configuré. Réessayez plus tard.",
      },
      { status: 503 },
    );
  }

  try {
    await sql`
      insert into public.access_requests
        (contact_name, bakery_name, city, phone, email, outlet_count, requested_plan, preferred_demo_date, preferred_contact, needs)
      values
        (${contactName}, ${bakeryName}, ${city}, ${phone}, ${email}, ${outletCount}, ${requestedPlan || null}, ${preferredDemoDate || null}, ${preferredContact || "whatsapp"}, ${needs})
    `;
  } catch (error) {
    console.error("Unable to save access request:", error);
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre demande pour le moment." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Votre demande a bien été envoyée." },
    { status: 201 },
  );
}

