import moment from 'moment'

export const calcTimeElapsed = (date: Date | string | number): string => {
  return moment(new Date(date)).fromNow()
}
