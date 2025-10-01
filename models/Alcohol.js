import mongoose from "mongoose";

const AlcoholSchema = new mongoose.Schema(
  {
    nazwa: {
      type: String,
      required: [true, "Nazwa alkoholu jest wymagana"],
      trim: true,
      unique: true,
    },
    kategoria: {
      type: String,
      required: [true, "Kategoria jest wymagana"],
      enum: ["wino_biale", "wino_czerwone", "whiskey", "inne"],
      default: "inne",
    },
    aktualnaIlosc: {
      type: Number,
      required: [true, "Aktualna liczba butelek jest wymagana"],
      min: [0, "Liczba butelek nie może być ujemna"],
      default: 0,
    },

    opis: {
      type: String,
      trim: true,
      maxlength: [500, "Opis nie może przekroczyć 500 znaków"],
    },
    ostatniadostawa: {
      data: {
        type: Date,
      },
      ilosc: {
        type: Number,
        min: 0,
      },
      dostarczylKto: {
        type: String,
        trim: true,
      },
    },
    laczenaDostarczona: {
      type: Number,
      default: 0,
      min: [0, "Całkowita ilość dostarczona nie może być ujemna"],
    },
    lacznaUzyta: {
      type: Number,
      default: 0,
      min: [0, "Całkowita ilość użyta nie może być ujemna"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to calculate total stock movement
AlcoholSchema.virtual("ruchMagazynowy").get(function () {
  return this.laczenaDostarczona - this.lacznaUzyta;
});

// Index for faster queries
AlcoholSchema.index({ kategoria: 1 });
AlcoholSchema.index({ aktualnaIlosc: 1 });
// nazwa already has unique index, no need for duplicate

// Pre-save middleware to validate stock consistency
AlcoholSchema.pre("save", function (next) {
  // Ensure aktualnaIlosc matches calculated stock movement
  const obliczonyStanMagazynu = this.laczenaDostarczona - this.lacznaUzyta;
  if (Math.abs(this.aktualnaIlosc - obliczonyStanMagazynu) > 0.01) {
    console.warn(
      `Niezgodność stanu magazynu dla ${this.nazwa}: aktualnaIlosc=${this.aktualnaIlosc}, obliczona=${obliczonyStanMagazynu}`
    );
  }
  next();
});

// Static method to get stock summary by category
AlcoholSchema.statics.pobierzPodsumowanieWedlugKategorii = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$kategoria",
        lacznaIloscProduktow: { $sum: 1 },
        lacznaIloscButelek: { $sum: "$aktualnaIlosc" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

// Instance method to update stock after delivery
AlcoholSchema.methods.dodajDostawe = function (ilosc, dostarczylKto = "") {
  this.aktualnaIlosc += ilosc;
  this.laczenaDostarczona += ilosc;
  this.ostatniadostawa = {
    data: new Date(),
    ilosc: ilosc,
    dostarczylKto: dostarczylKto,
  };
  return this.save();
};

// Instance method to update stock after usage
AlcoholSchema.methods.uzyj = function (ilosc) {
  if (ilosc > this.aktualnaIlosc) {
    throw new Error(
      `Nie można użyć ${ilosc} butelek. Dostępne: ${this.aktualnaIlosc}`
    );
  }
  this.aktualnaIlosc -= ilosc;
  this.lacznaUzyta += ilosc;
  return this.save();
};

const Alcohol =
  mongoose.models.Alcohol || mongoose.model("Alcohol", AlcoholSchema);

export default Alcohol;
