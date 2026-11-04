// Runiverso · avisos de carreras en el móvil (Web Push)
// - Cada mañana (pg_cron): avisa a los corredores apuntados 7 días antes, el día antes y el mismo día.
// - POST {"test":true} con la sesión del usuario: le manda un aviso de prueba.
// - POST {"key":true}: devuelve la clave pública de envío (la app la usa para suscribirse).
// Las claves de envío las genera la función la primera vez y las guarda en push_config (solo accesible con service role).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const DATA_URL = "https://runiverso.com/app/data.js";
const APP_URL = "https://runiverso.com/app/";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

let keys: { public_key: string; private_key: string } | null = null;
async function vapid() {
  if (keys) return keys;
  let { data } = await db.from("push_config").select("public_key,private_key").eq("id", 1).maybeSingle();
  if (!data) {
    const k = webpush.generateVAPIDKeys();
    await db.from("push_config").upsert({ id: 1, public_key: k.publicKey, private_key: k.privateKey }, { onConflict: "id", ignoreDuplicates: true });
    ({ data } = await db.from("push_config").select("public_key,private_key").eq("id", 1).maybeSingle());
  }
  keys = data!;
  webpush.setVapidDetails("mailto:hola@runiverso.com", keys.public_key, keys.private_key);
  return keys;
}

type Sub = { endpoint: string; user_id: string; p256dh: string; auth: string };
type Race = { id: string; n: string; c: string; d: string; h?: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

function madridDate(offsetDays: number) {
  const now = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

async function send(sub: Sub, payload: Record<string, string>) {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), { TTL: 86400 });
    return true;
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) await db.from("push_subs").delete().eq("endpoint", sub.endpoint);
    console.error("push error", code, (e as Error).message);
    return false;
  }
}

async function subsOf(userIds: string[]) {
  if (!userIds.length) return [] as Sub[];
  const { data } = await db.from("push_subs").select("endpoint,user_id,p256dh,auth").in("user_id", userIds);
  return (data ?? []) as Sub[];
}

async function testFor(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data } = await db.auth.getUser(token);
  if (!data?.user) return json({ error: "Inicia sesión" }, 401);
  const subs = await subsOf([data.user.id]);
  let ok = 0;
  for (const s of subs) if (await send(s, { title: "Avisos activados ✓", body: "Te avisaremos antes de cada carrera a la que te apuntes.", url: APP_URL + "#perfil", tag: "rv-test" })) ok++;
  return json({ sent: ok, devices: subs.length });
}

async function daily() {
  const src = await (await fetch(DATA_URL + "?t=" + Date.now())).text();
  const m = src.match(/RV_RACES = (\[[\s\S]*?\]);/);
  if (!m) return json({ error: "sin datos" }, 500);
  const races: Race[] = JSON.parse(m[1]);
  const plan: Record<string, { kind: string; title: (r: Race) => string; body: (r: Race) => string }> = {
    [madridDate(7)]: { kind: "d7", title: (r) => "Queda una semana: " + r.n, body: (r) => "El " + r.d.split("-").reverse().join("/") + " en " + r.c + ". Revisa la recogida de dorsales y prepara la salida." },
    [madridDate(1)]: { kind: "d1", title: (r) => "Mañana corres: " + r.n, body: (r) => (r.h ? "Salida a las " + r.h + " en " : "Mañana en ") + r.c + ". Cena ligera, dorsal preparado y a descansar." },
    [madridDate(0)]: { kind: "d0", title: (r) => "¡Hoy es el día! " + r.n, body: (r) => "Disfruta la carrera" + (r.h ? " (salida " + r.h + ")" : "") + ". Luego añade tu tiempo y gana tu medalla." },
  };
  const due = races.filter((r) => plan[r.d]);
  if (!due.length) return json({ races: 0, sent: 0 });
  const { data: signups } = await db.from("signups").select("user_id,race_id").in("race_id", due.map((r) => r.id));
  if (!signups?.length) return json({ races: due.length, sent: 0 });
  const subs = await subsOf([...new Set(signups.map((s) => s.user_id))]);
  const byUser = new Map<string, Sub[]>();
  for (const s of subs) byUser.set(s.user_id, [...(byUser.get(s.user_id) ?? []), s]);
  let sent = 0;
  for (const su of signups) {
    const r = due.find((x) => x.id === su.race_id)!, p = plan[r.d], mine = byUser.get(su.user_id) ?? [];
    if (!mine.length) continue;
    const { error } = await db.from("push_log").insert({ user_id: su.user_id, race_id: r.id, kind: p.kind });
    if (error) continue; // ya avisado
    for (const s of mine) if (await send(s, { title: p.title(r), body: p.body(r), url: APP_URL + "#perfil", tag: "rv-" + r.id + "-" + p.kind })) sent++;
  }
  return json({ races: due.length, signups: signups.length, sent });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  let body: { test?: boolean; key?: boolean } = {};
  try { body = await req.json(); } catch { /* sin cuerpo */ }
  const k = await vapid();
  if (body.key) return json({ publicKey: k.public_key });
  return body.test ? testFor(req) : daily();
});
