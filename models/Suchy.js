import mongoose from "mongoose";

const suchySchema = new mongoose.Schema(
  {
    nazwa: {
      type: String,
      required: true,
      trim: true,
    },
    kategoria: {
      type: String,
      required: true,
      enum: ["suchy"],
      default: "suchy",
      trim: true,
    },
    podkategoria: {
      type: String,
      required: true,
      enum: ["cukier", "kawa", "maka", "sol", "pieprz", "przyprawy"],
      trim: true,
    },
    aktualnaIlosc: {
      type: Number,
      default: 0,
      min: 0,
    },
    jednostka: {
      type: String,
      default: "kg",
      enum: ["kg", "g", "szt", "opakowanie"],
    },
    opis: {
      type: String,
      default: "",
      trim: true,
    },
    dataUtworzenia: {
      type: Date,
      default: Date.now,
    },
    dataModyfikacji: {
      type: Date,
      default: Date.now,
    },
    ostatniaDostwa: {
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
      min: 0,
    },
    lacznaUzyta: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total deliveries
suchySchema.virtual("calkowiteDostawy").get(function () {
  return this.aktualnaIlosc + (this.lacznaUzyta || 0);
});

// Virtual for stock movement
suchySchema.virtual("ruchMagazynowy").get(function () {
  return this.laczenaDostarczona - this.lacznaUzyta;
});

// Method to add delivery
suchySchema.methods.dodajDostawe = function (
  ilosc,
  nazwaPracownika,
  opis = ""
) {
  this.aktualnaIlosc += ilosc;
  this.laczenaDostarczona += ilosc;
  this.ostatniaDostwa = {
    data: new Date(),
    ilosc: ilosc,
    dostarczylKto: nazwaPracownika,
  };
  this.dataModyfikacji = new Date();
  return this.save();
};

// Method to use product
suchySchema.methods.uzyj = function (ilosc, nazwaPracownika, opis = "") {
  if (this.aktualnaIlosc < ilosc) {
    throw new Error("Niewystarczająca ilość w magazynie");
  }
  this.aktualnaIlosc -= ilosc;
  this.lacznaUzyta += ilosc;
  this.dataModyfikacji = new Date();
  return this.save();
};

// Pre-save middleware to update modification date
suchySchema.pre("save", function (next) {
  this.dataModyfikacji = new Date();
  next();
});

// Indexes for better performance
suchySchema.index({ kategoria: 1, podkategoria: 1 });
suchySchema.index({ nazwa: 1 });
suchySchema.index({ dataUtworzenia: -1 });

// Static method to get products by subcategory
suchySchema.statics.pobierzWedlugPodkategorii = function (podkategoria) {
  return this.find({ podkategoria }).sort({ nazwa: 1 });
};

const Suchy = mongoose.models.Suchy || mongoose.model("Suchy", suchySchema);

export default Suchy;
