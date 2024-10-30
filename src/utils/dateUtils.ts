export class DateUtils {
  constructor(private dateFormat: string) {}

  getCurrentFormattedDate(): string {
    return window.moment().format(this.dateFormat);
  }

  formatDate(date: Date | string | number): string {
    return window.moment(date).format(this.dateFormat);
  }

  isValidDate(date: string): boolean {
    return window.moment(date, this.dateFormat, true).isValid();
  }

  parseDate(dateString: string): moment.Moment | null {
    const parsed = window.moment(dateString, this.dateFormat, true);
    return parsed.isValid() ? parsed : null;
  }

  compareDates(date1: string, date2: string): number {
    const moment1 = this.parseDate(date1);
    const moment2 = this.parseDate(date2);

    if (!moment1 || !moment2) {
      throw new Error('Invalid date format');
    }

    return moment1.valueOf() - moment2.valueOf();
  }

  setDateFormat(format: string): void {
    this.dateFormat = format;
  }

  // Utility method for relative time
  getRelativeTime(date: string): string {
    const parsedDate = this.parseDate(date);
    if (!parsedDate) {
      throw new Error('Invalid date format');
    }
    return parsedDate.fromNow();
  }

  // Get start of day
  getStartOfDay(): string {
    return window.moment().startOf('day').format(this.dateFormat);
  }

  // Get end of day
  getEndOfDay(): string {
    return window.moment().endOf('day').format(this.dateFormat);
  }
}
