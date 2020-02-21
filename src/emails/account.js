const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.send({
    to:'ajay.ctc@gmail.com',
    from:'ajay.tech.ctc@gmail.com',
    subject:'Send Grid Mail Test',
    text:'Hi there, This is testing mail from send grid'
})


const sendWelcomeEmail=(email,name)=>{sgMail.send({
    to:email,
    from: 'ajay.tech.ctc@gmail.com',
    subject:'Welcome to joining Team',
    text:`Welcome to the app,${name}.Let me know how you get along with the app`

})
}

const sendCancellationEmail=(email,name)=>{sgMail.send({
    to:email,
    from: 'ajay.tech.ctc@gmail.com',
    subject:'Sorry To hear about this',
    text:`We have recieved email for cancellation,${name}.we could have done something better to kept in team`

})
}
module.exports={sendWelcomeEmail,sendCancellationEmail}