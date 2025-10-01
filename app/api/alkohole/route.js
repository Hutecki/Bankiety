import connectDB from '../../../config/database.js';
import Alcohol from '../../../models/Alcohol.js';

export async function GET() {
  try {
    await connectDB();
    
    const alkohole = await Alcohol.find({}).sort({ nazwa: 1 });
    
    return Response.json(alkohole);
  } catch (error) {
    console.error('Błąd podczas pobierania alkoholi:', error);
    return Response.json(
      { error: 'Błąd podczas pobierania alkoholi' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const { nazwa, kategoria, aktualnaIlosc, opis } = data;
    
    const nowyAlkohol = new Alcohol({
      nazwa,
      kategoria,
      aktualnaIlosc: aktualnaIlosc || 0,
      opis: opis || ''
    });
    
    await nowyAlkohol.save();
    
    return Response.json(nowyAlkohol, { status: 201 });
  } catch (error) {
    console.error('Błąd podczas dodawania alkoholu:', error);
    
    if (error.code === 11000) {
      return Response.json(
        { error: 'Alkohol o tej nazwie już istnieje' },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: 'Błąd podczas dodawania alkoholu' },
      { status: 500 }
    );
  }
}