import mongoose from "mongoose";

const naciagiSchema = new mongoose.Schema(
  {
    nazwa: {
      type: String,
      required: true,
      trim: true,
    },
    kategoria: {
      type: String,
      required: true,
      enum: ["napoje", "mleko"],
      trim: true,
    },
    podkategoria: {
      type: String,
      required: true,
      enum: ["pepsi", "7up", "mirinda", "mleko_zwykle", "mleko_bl"],
      trim: true,
    },
    aktualnaIlosc: {
      type: Number,
      default: 0,
      min: 0,
    },
    jednostka: {
      type: String,
      default: "szt",
      enum: ["szt", "l", "ml"],
    },
    opis: {
      type: String,
      default: "",
    },
    dataUtworzenia: {
      type: Date,
      default: Date.now,
    },
    dataModyfikacji: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total deliveries
naciagiSchema.virtual("calkowiteDostawy").get(function () {
  return this.aktualnaIlosc + (this.zuzycie || 0);
});

// Virtual for usage (will be calculated from transactions)
naciagiSchema.virtual("zuzycie").get(function () {
  // This will be populated from transactions when needed
  return this._zuzycie || 0;
});

// Method to add delivery
naciagiSchema.methods.dodajDostawe = function (
  ilosc,
  nazwaPracownika,
  opis = ""
) {
  this.aktualnaIlosc += ilosc;
  this.dataModyfikacji = new Date();
  return this.save();
};

// Method to use product
naciagiSchema.methods.uzyj = function (ilosc, nazwaPracownika, opis = "") {
  if (this.aktualnaIlosc < ilosc) {
    throw new Error("Niewystarczająca ilość w magazynie");
  }
  this.aktualnaIlosc -= ilosc;
  this.dataModyfikacji = new Date();
  return this.save();
};

// Pre-save middleware to update modification date
naciagiSchema.pre("save", function (next) {
  this.dataModyfikacji = new Date();
  next();
});

// Indexes for better performance
naciagiSchema.index({ kategoria: 1, podkategoria: 1 });
naciagiSchema.index({ nazwa: 1 });
naciagiSchema.index({ dataUtworzenia: -1 });

const Naciagi =
  mongoose.models.Naciagi || mongoose.model("Naciagi", naciagiSchema);

export default Naciagi;
