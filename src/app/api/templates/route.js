import { connectToDatabase } from '../../../lib/db';
import Template from '../../../models/Template';

export async function GET() {
  await connectToDatabase();
  try {
    const templates = await Template.find();
    return new Response(JSON.stringify(templates), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const template = new Template(body);
    await template.save();
    return new Response(JSON.stringify(template), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}