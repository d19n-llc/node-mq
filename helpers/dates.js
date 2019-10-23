const moment = require("moment");

exports.utcDate = () => moment.utc().toISOString();
// Moment start of week is Sunday or 0 by default so we want the week to begin on
// Monday So we will set the start of the week equal to isoWeekDay 1.
exports.utcDateStartOfWeek = (dateString) => {
	const date = moment.utc(dateString).isoWeekday(1);
	return date;
};

exports.addTimestamps = (params) => {
	const { isUpdating } = params;
	const timestamp = moment.utc().toISOString();
	if (isUpdating) {
		return {
			updatedAt: timestamp,
			updatedAtConverted: new Date()
		};
	}
	return {
		createdAt: timestamp,
		updatedAt: timestamp,
		updatedAtConverted: new Date(),
		createdAtConverted: new Date()
	};
};

// ************************************************************************** //

// Getters

// ************************************************************************** //

/**
 *
 *
 * @export
 * @returns current day ISO Date
 */
exports.getTimeFromDate = (dateString) => {
	let date;
	if (dateString) {
		// Convert the date to minutes
		date = moment.utc(dateString).format("HH:mm");
	}
	return date;
};
exports.getCurrentWeekInt = () => moment().isoWeek();
// Start the week Monday = 0
exports.getCurrentDayOfWeekInt = (dateString) =>
	dateString ? moment.utc(dateString).isoWeekday() : moment.utc().isoWeekday();
// Return the current weeks this year
exports.getTotalWeeksInYearInt = () => moment().isoWeeksInYear();
// Returns a list of week days (Monday - Sunday)
exports.getDaysOfWeekStrings = () => moment.utc().weekdays();
// Return the days in the current month
exports.getDaysInMonth = () => moment.utc().daysInMonth();
// Returns the current day of the month as a number
exports.getCurrentDayOfMonthInt = () => moment().date();
// Return the days left in a month from today
exports.getDaysLeftInMonth = (dateString) => {
	// Get todays date as a string
	const today = moment.utc(dateString).date() || moment.utc().date();
	// Set the date either passed in or defaults to todays date
	const date =
		moment.utc(dateString).toISOString() || moment.utc().toISOString();
	// Get the days in the month
	const totalDaysInMonth = moment.utc(date).daysInMonth();
	// Return days in the current month as default
	return totalDaysInMonth - today;
};
// Return the days left in a week from today
exports.getDaysLeftInWeek = (dateString) => {
	// Get todays date as a string
	const dayOfWeek =
		moment.utc(dateString).isoWeekday() || moment.utc().isoWeekday();
	// Total days in a week
	const totalDaysInWeek = 7;
	// Return days left in the week
	return totalDaysInWeek - dayOfWeek;
};
// Pass in any day of the month to check the day of the month
// 'dddd'	Sunday Monday ... Friday Saturday
exports.getDayOfWeekString = (dateString) =>
	moment.utc(dateString).format("dddd");
// Determine the difference between two dates
exports.getDiffIndates = (startDate, endDate, interval) =>
	// OUTCOMES AND MEANING OF DIFFERENCE
	// if the integer returned is > 0 === startDate date is before the endDate date.
	// if the integer returned is < 0 === endDate date is before startDate date
	moment.utc(endDate).diff(moment.utc(startDate), interval || "days");

// ************************************************************************** //

// Setters

// ************************************************************************** //
// Return formatted ISO String from date stiring no time
exports.setDateUtcNoTime = (dateString) =>
	moment
		.utc(dateString)
		.hour(0)
		.minute(0)
		.second(0)
		.millisecond(0)
		.toISOString();

// Create a date from an string value for an day
exports.setDateInFuture = (dateString, interval, intervalType) => {
	const date = moment
		.utc(dateString)
		.add(Number(interval), intervalType)
		.toISOString();
	return date;
};

// Create a date from an string value for an day
exports.setDateInPast = (dateString, interval, intervalType) => {
	const date = moment
		.utc(dateString)
		.subtract(Number(interval), intervalType)
		.toISOString();
	return date;
};
// Create a date from an string value for an day
exports.setDateFromWeekAndDay = (year, weekNumber, month, dayOfWeek) => {
	// Moment starts Monday = 1 Sunday = 7
	// We start Monday at 1 Sunday = 6
	// We need to add + 1 to set the date correctly.
	const dayOfWeekInterface = Number(dayOfWeek + 1);
	const dateFromTime = moment()
		.utc()
		.year(year)
		.month(month)
		.week(Number(weekNumber))
		.day(dayOfWeekInterface)
		.toISOString();

	return dateFromTime;
};

exports.setDateAsIsoString = (dateString) =>
	moment.utc(dateString).toISOString();

exports.setTimeFrom24Hours = (time, timeFormat = "HHmm") => {
	// Accepts the format "02:00"
	const timeConverted = moment(time, timeFormat)
		.utc()
		.format("HH:mm");
	return timeConverted;
};

exports.formatDate = (date, format = "YYYY-MM-DD") => {
	const formatted = moment(date, format)
		.utc()
		.format(format);
	return formatted;
};

// ************************************************************************** //

// Parsers

// ************************************************************************** //

// Parse date string into object
exports.parseDateToObject = (date) => ({
	year: moment.utc(date).year(),
	month: moment.utc(date).month() + 1, // Moment starts January at 0
	week: moment.utc(date).isoWeek(),
	dayOfWeek: moment.utc(date).isoWeekday(),
	dayOfMonth: moment.utc(date).date(),
	dayOfYear: moment.utc(date).dayOfYear(),
	time: moment.utc(date).format("HHmm")
});

// ************************************************************************** //

// Checkers

// ************************************************************************** //
exports.isDateInPast = (dateA, dateB) => {
	const firstDate = moment.utc(dateA); // today or past date
	const secondDate = moment.utc(dateB); // future date

	return moment(firstDate).isBefore(secondDate);
};

// ************************************************************************** //

// Constructors

// ************************************************************************** //
// Create a date from an string value for an hour and a day of the month
exports.constructDateFromDayAndHour = (params) => {
	const { time, day, month, year } = params;
	// time should be in format 'HH:mm'
	const [hours, minutes] = time.split(":");
	const dateFromTime = moment()
		.utc()
		.set({
			year: year ? Number(year) : moment().year(),
			month: month ? Number(month - 1) : moment().month(),
			date: Number(day),
			hour: Number(hours),
			minute: Number(minutes),
			second: 0,
			millisecond: 0
		})
		.toISOString();
	return dateFromTime;
};
