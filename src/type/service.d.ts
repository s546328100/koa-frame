import user from '../service/user'
import activity from '../service/activity'
import activityUser from '../service/activityUser'
import admin from '../service/admin'
import form from '../service/form'
import file from '../service/file'
import prize from '../service/prize'
import schedule from '../service/schedule'
import message from '../service/message'

export default interface serivce {
  user: user
  activity: activity
  activityUser: activityUser
  admin: admin
  form: form
  file: file
  prize: prize
  schedule: schedule
  message: message
}
