import mongoose from "mongoose";

const naciagiTransactionSchema = new mongoose.Schema(
  {
    naciagiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Naciagi",
      required: true,
    },
    nazwaNaciagu: {
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
      min: 0,
    },
    jednostka: {
      type: String,
      default: "szt",
      enum: ["szt", "l", "ml"],
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
      enum: ["napoje", "mleko"],
    },
    podkategoria: {
      type: String,
      required: true,
      enum: [
        "pepsi",
        "7up",
        "mirinda",
        "softy",
        "paliwka",
        "mleko_zwykle",
        "mleko_bl",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Static method to create delivery transaction
naciagiTransactionSchema.statics.stworzDostawe = async function (
  naciagiId,
  nazwaNaciagu,
  ilosc,
  nazwaPracownika,
  opis = "",
  kategoria,
  podkategoria,
  jednostka = "szt"
) {
  return this.create({
    naciagiId,
    nazwaNaciagu,
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
naciagiTransactionSchema.statics.stworzUzycie = async function (
  naciagiId,
  nazwaNaciagu,
  ilosc,
  nazwaPracownika,
  opis = "",
  kategoria,
  podkategoria,
  jednostka = "szt"
) {
  return this.create({
    naciagiId,
    nazwaNaciagu,
    typTransakcji: "uzycie",
    ilosc,
    nazwaPracownika,
    opis,
    kategoria,
    podkategoria,
    jednostka,
  });
};

// Indexes for better performance
naciagiTransactionSchema.index({ naciagiId: 1, dataTransakcji: -1 });
naciagiTransactionSchema.index({ typTransakcji: 1, dataTransakcji: -1 });
naciagiTransactionSchema.index({
  kategoria: 1,
  podkategoria: 1,
  dataTransakcji: -1,
});
naciagiTransactionSchema.index({ dataTransakcji: -1 });

const NaciagiTransaction =
  mongoose.models.NaciagiTransaction ||
  mongoose.model("NaciagiTransaction", naciagiTransactionSchema);

export default NaciagiTransaction;
