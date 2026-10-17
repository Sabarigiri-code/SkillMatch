import smtplib

emails = ['girimsabari@gmail.com', 'girimsabari7@gmail.com', 'sabarihackathon@gmail.com', 'girimsai152@gmail.com']
pwd = 'fxnikpxhnsfojmjo'

for e in emails:
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(e, pwd)
        print('SUCCESS: ' + e)
        server.quit()
    except Exception as ex:
        print('FAILED: ' + e + ' - ' + str(ex))
