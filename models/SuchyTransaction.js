import mongoose from "mongoose";

const suchyTransactionSchema = new mongoose.Schema(
  {
    suchyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suchy",
      required: true,
    },
    nazwaSuchy: {
      type: String,
      required: true,
      trim: true,
    },
    typTransakcji: {
      type: String,
      required: true,
      enum: ["dostawa", "uzycie"],
      trim: true,
    },
    ilosc: {
      type: Number,
      required: true,
    },
    jednostka: {
      type: String,
      default: "kg",
      enum: ["kg", "g", "szt", "opakowanie"],
    },
    nazwaPracownika: {
      type: String,
      required: true,
      trim: true,
    },
    opis: {
      type: String,
      default: "",
      trim: true,
    },
    dataTransakcji: {
      type: Date,
      default: Date.now,
    },
    kategoria: {
      type: String,
      required: true,
      enum: ["suchy"],
      default: "suchy",
    },
    podkategoria: {
      type: String,
      required: true,
      enum: ["cukier", "kawa", "maka", "sol", "pieprz", "przyprawy"],
    },
  },
  {
    timestamps: true,
  }
);

// Static method to create delivery transaction
suchyTransactionSchema.statics.stworzDostawe = async function (
  suchyId,
  nazwaSuchy,
  ilosc,
  nazwaPracownika,
  opis = "",
  kategoria,
  podkategoria,
  jednostka = "kg"
) {
  return this.create({
    suchyId,
    nazwaSuchy,
    typTransakcji: "dostawa",
    ilosc,
    nazwaPracownika,
    opis,
    kategoria,
    podkategoria,
    jednostka,
  });
};

// Static method to create usage transaction
suchyTransactionSchema.statics.stworzUzycie = async function (
  suchyId,
  nazwaSuchy,
  ilosc,
  nazwaPracownika,
  opis = "",
  kategoria,
  podkategoria,
  jednostka = "kg"
) {
  return this.create({
    suchyId,
    nazwaSuchy,
    typTransakcji: "uzycie",
    ilosc: -Math.abs(ilosc), // Ensure usage is negative
    nazwaPracownika,
    opis,
    kategoria,
    podkategoria,
    jednostka,
  });
};

// Index for better performance
suchyTransactionSchema.index({ suchyId: 1 });
suchyTransactionSchema.index({ dataTransakcji: -1 });
suchyTransactionSchema.index({ podkategoria: 1 });
suchyTransactionSchema.index({ typTransakcji: 1 });

const SuchyTransaction =
  mongoose.models.SuchyTransaction ||
  mongoose.model("SuchyTransaction", suchyTransactionSchema);

export default SuchyTransaction;
