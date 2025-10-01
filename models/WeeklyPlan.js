const mongoose = require("mongoose");

const weeklyPlanSchema = new mongoose.Schema({
  nazwaFirmy: {
    type: String,
    required: true,
    trim: true,
  },
  dzienTygodnia: {
    type: String,
    required: true,
    enum: [
      "poniedziałek",
      "wtorek",
      "środa",
      "czwartek",
      "piątek",
      "sobota",
      "niedziela",
    ],
  },
  godzinyObslugi: {
    type: String,
    required: true,
    trim: true,
  },
  sala: {
    type: String,
    required: false,
    trim: true,
  },
  liczbaOsob: {
    type: Number,
    required: false,
    min: 1,
  },
  opiekun: {
    type: String,
    required: false,
    trim: true,
  },
  uwagi: {
    type: String,
    required: false,
    trim: true,
  },
  rokTydzien: {
    type: String,
    required: true,
    index: true, // Format: "2025-W39" for week 39 of 2025
  },
  dataUtworzenia: {
    type: Date,
    default: Date.now,
  },
  dataModyfikacji: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying by week and day
weeklyPlanSchema.index({ rokTydzien: 1, dzienTygodnia: 1 });

// Static method to get current week string
weeklyPlanSchema.statics.getCurrentWeek = function () {
  const now = new Date();
  const year = now.getFullYear();

  // Get ISO week number (Monday as first day of week)
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
};

// Static method to clean up old weeks data
weeklyPlanSchema.statics.cleanupOldWeeks = async function () {
  const currentWeek = this.getCurrentWeek();
  const result = await this.deleteMany({ rokTydzien: { $ne: currentWeek } });
  return result;
};

// Static method to clean up all data (manual cleanup button)
weeklyPlanSchema.statics.cleanupAllData = async function () {
  const result = await this.deleteMany({});
  return result;
};

// Update modification date before saving
weeklyPlanSchema.pre("save", function (next) {
  this.dataModyfikacji = new Date();
  next();
});

const WeeklyPlan =
  mongoose.models.WeeklyPlan || mongoose.model("WeeklyPlan", weeklyPlanSchema);

module.exports = WeeklyPlan;
