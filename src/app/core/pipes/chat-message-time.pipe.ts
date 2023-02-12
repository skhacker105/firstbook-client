import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatMessageTime'
})
export class ChatMessageTimePipe implements PipeTransform {

  transform(value: string | Date, ...args: unknown[]): unknown {
    if (typeof value === 'string') value = new Date(value);
    const diff = Math.floor((Date.now() - value.getTime()) / 1000);
    return diff < (60 * 60 * 24) && this.getHoursAndMins(value) ||
      diff < (60 * 60 * 24 * 7) && this.getDay(value) + ' ' + this.getHoursAndMins(value) ||
      diff && this.getDateAndMonth(value);
  }

  getHoursAndMins(dt: Date): string {
    let h = dt.getHours();
    let m = dt.getMinutes();
    const ampm = h > 12 ? 'PM' : 'AM';
    h = h >= 12 ? h - 12 : h;
    let min = m <= 9 ? '0' + m : m.toString();
    return h + ':' + min + ' ' + ampm;
  }

  getDay(dt: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dt.getDay()];
  }

  getDateAndMonth(dt: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return dt.getDate() + months[dt.getMonth()];
  }

}
