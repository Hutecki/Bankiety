import mongoose from "mongoose";

const AlcoholTransactionSchema = new mongoose.Schema(
  {
    alkoholId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alcohol",
      required: [true, "ID alkoholu jest wymagane"],
    },
    nazwaAlkoholu: {
      type: String,
      required: [true, "Nazwa alkoholu jest wymagana"],
      trim: true,
    },
    typTransakcji: {
      type: String,
      required: [true, "Typ transakcji jest wymagany"],
      enum: ["dostawa", "uzycie", "korekta", "strata"],
      index: true,
    },
    ilosc: {
      type: Number,
      required: [true, "Ilość jest wymagana"],
    },
    iloscPrzed: {
      type: Number,
      required: [true, "Stan przed transakcją jest wymagany"],
      min: [0, "Stan przed transakcją nie może być ujemny"],
    },
    iloscPo: {
      type: Number,
      required: [true, "Stan po transakcji jest wymagany"],
      min: [0, "Stan po transakcji nie może być ujemny"],
    },

    nazwaPracownika: {
      type: String,
      required: [true, "Nazwa pracownika jest wymagana"],
      trim: true,
      index: true,
    },

    bankietId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Banquet",
      index: true,
    },

    notatki: {
      type: String,
      trim: true,
      maxlength: [1000, "Notatki nie mogą przekroczyć 1000 znaków"],
    },
    powod: {
      type: String,
      trim: true,
      maxlength: [500, "Powód nie może przekroczyć 500 znaków"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
AlcoholTransactionSchema.index({ alkoholId: 1, createdAt: -1 });
AlcoholTransactionSchema.index({ typTransakcji: 1, createdAt: -1 });
AlcoholTransactionSchema.index({ nazwaPracownika: 1, createdAt: -1 });
AlcoholTransactionSchema.index({ createdAt: -1 });

// Virtual for transaction direction (positive/negative)
AlcoholTransactionSchema.virtual("czyDodatnia").get(function () {
  return ["dostawa", "korekta"].includes(this.typTransakcji) && this.ilosc > 0;
});

// Virtual for formatted transaction description
AlcoholTransactionSchema.virtual("opis").get(function () {
  const mapaTyow = {
    dostawa: "Dostawa",
    uzycie: "Użycie",
    korekta: "Korekta",
    strata: "Utrata/Zniszczenie",
  };

  const typ = mapaTyow[this.typTransakcji] || this.typTransakcji;
  const znak = this.ilosc >= 0 ? "+" : "";
  return `${typ}: ${znak}${this.ilosc} butelek`;
});

// Static method to get transaction history for specific alcohol
AlcoholTransactionSchema.statics.pobierzHistorieAlkoholu = function (
  alkoholId,
  limit = 50
) {
  return this.find({ alkoholId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("alkoholId", "nazwa kategoria");
};

// Static method to get transactions by date range
AlcoholTransactionSchema.statics.pobierzTransakcjeWZakresieData = function (
  dataOd,
  dataDo,
  typTransakcji = null
) {
  const zapytanie = {
    createdAt: {
      $gte: new Date(dataOd),
      $lte: new Date(dataDo),
    },
  };

  if (typTransakcji) {
    zapytanie.typTransakcji = typTransakcji;
  }

  return this.find(zapytanie)
    .sort({ createdAt: -1 })
    .populate("alkoholId", "nazwa kategoria");
};

// Static method to get employee activity summary
AlcoholTransactionSchema.statics.pobierzAktywnoscPracownika = function (
  nazwaPracownika,
  dataOd = null,
  dataDo = null
) {
  const zapytanie = { nazwaPracownika };

  if (dataOd && dataDo) {
    zapytanie.createdAt = {
      $gte: new Date(dataOd),
      $lte: new Date(dataDo),
    };
  }

  return this.aggregate([
    { $match: zapytanie },
    {
      $group: {
        _id: "$typTransakcji",
        liczba: { $sum: 1 },
        lacznaIlosc: { $sum: "$ilosc" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Static method to create a delivery transaction
AlcoholTransactionSchema.statics.utworzTransakcjeDostawy = function (
  alkoholId,
  nazwaAlkoholu,
  ilosc,
  nazwaPracownika,
  opcje = {}
) {
  return this.create({
    alkoholId,
    nazwaAlkoholu,
    typTransakcji: "dostawa",
    ilosc: Math.abs(ilosc), // Ensure positive for deliveries
    iloscPrzed: opcje.iloscPrzed || 0,
    iloscPo: (opcje.iloscPrzed || 0) + Math.abs(ilosc),
    nazwaPracownika,
    notatki: opcje.notatki || "",
  });
};

// Static method to create a usage transaction
AlcoholTransactionSchema.statics.utworzTransakcjeUzycia = function (
  alkoholId,
  nazwaAlkoholu,
  ilosc,
  nazwaPracownika,
  opcje = {}
) {
  return this.create({
    alkoholId,
    nazwaAlkoholu,
    typTransakcji: "uzycie",
    ilosc: -Math.abs(ilosc), // Ensure negative for usage
    iloscPrzed: opcje.iloscPrzed || 0,
    iloscPo: (opcje.iloscPrzed || 0) - Math.abs(ilosc),
    nazwaPracownika,
    bankietId: opcje.bankietId || null,
    notatki: opcje.notatki || "",
    powod: opcje.powod || "",
  });
};

const AlcoholTransaction =
  mongoose.models.AlcoholTransaction ||
  mongoose.model("AlcoholTransaction", AlcoholTransactionSchema);

export default AlcoholTransaction;
