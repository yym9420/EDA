"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// import AWS from 'aws-sdk';
const env_1 = require("../env");
const client_ses_1 = require("@aws-sdk/client-ses");
if (!env_1.SES_EMAIL_TO || !env_1.SES_EMAIL_FROM || !env_1.SES_REGION) {
    throw new Error("Please add the SES_EMAIL_TO, SES_EMAIL_FROM and SES_REGION environment variables in an env.js file located in the root directory");
}
const client = new client_ses_1.SESClient({ region: "eu-west-1" });
const handler = async (event) => {
    console.log("Event ", event);
    for (const record of event.Records) {
        const snsMessage = JSON.parse(record.Sns.Message);
        if (snsMessage.Records) {
            console.log("Record body ", JSON.stringify(snsMessage));
            for (const messageRecord of snsMessage.Records) {
                const s3e = messageRecord.s3;
                const srcBucket = s3e.bucket.name;
                // Object key may have spaces or unicode non-ASCII characters.
                const srcKey = decodeURIComponent(s3e.object.key.replace(/\+/g, " "));
                try {
                    const { name, email, message } = {
                        name: "The Photo Album",
                        email: env_1.SES_EMAIL_FROM,
                        message: `We received your Image. Its URL is s3://${srcBucket}/${srcKey}`,
                    };
                    const params = sendEmailParams({ name, email, message });
                    await client.send(new client_ses_1.SendEmailCommand(params));
                }
                catch (error) {
                    console.log("ERROR is: ", error);
                    // return;
                }
            }
        }
    }
};
exports.handler = handler;
function sendEmailParams({ name, email, message }) {
    const parameters = {
        Destination: {
            ToAddresses: [env_1.SES_EMAIL_TO],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: getHtmlContent({ name, email, message }),
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: `New image Upload`,
            },
        },
        Source: env_1.SES_EMAIL_FROM,
    };
    return parameters;
}
function getHtmlContent({ name, email, message }) {
    return `
    <html>
      <body>
        <h2>Sent from: </h2>
        <ul>
          <li style="font-size:18px">👤 <b>${name}</b></li>
          <li style="font-size:18px">✉️ <b>${email}</b></li>
        </ul>
        <p style="font-size:18px">${message}</p>
      </body>
    </html> 
  `;
}
function getTextContent({ name, email, message }) {
    return `
    Received an Email. 📬
    Sent from:
        👤 ${name}
        ✉️ ${email}
    ${message}
  `;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlybWF0aW9uTWFpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlybWF0aW9uTWFpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZCQUE2QjtBQUM3QixnQ0FBa0U7QUFDbEUsb0RBSTZCO0FBRTdCLElBQUksQ0FBQyxrQkFBWSxJQUFJLENBQUMsb0JBQWMsSUFBSSxDQUFDLGdCQUFVLEVBQUU7SUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FDYixrSUFBa0ksQ0FDbkksQ0FBQztDQUNIO0FBUUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFFL0MsTUFBTSxPQUFPLEdBQWUsS0FBSyxFQUFFLEtBQVUsRUFBRSxFQUFFO0lBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdCLEtBQUssTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbEQsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN4RCxLQUFLLE1BQU0sYUFBYSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQzlDLE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNsQyw4REFBOEQ7Z0JBQzlELE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEUsSUFBSTtvQkFDRixNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBbUI7d0JBQy9DLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLEtBQUssRUFBRSxvQkFBYzt3QkFDckIsT0FBTyxFQUFFLDJDQUEyQyxTQUFTLElBQUksTUFBTSxFQUFFO3FCQUMxRSxDQUFDO29CQUNGLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDekQsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDakQ7Z0JBQUMsT0FBTyxLQUFjLEVBQUU7b0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqQyxVQUFVO2lCQUNYO2FBQ0Y7U0FDRjtLQUNGO0FBQ0gsQ0FBQyxDQUFDO0FBM0JXLFFBQUEsT0FBTyxXQTJCbEI7QUFFRixTQUFTLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFrQjtJQUMvRCxNQUFNLFVBQVUsR0FBMEI7UUFDeEMsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFLENBQUMsa0JBQVksQ0FBQztTQUM1QjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLE9BQU87b0JBQ2hCLElBQUksRUFBRSxjQUFjLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO2lCQUMvQzthQUNGO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixJQUFJLEVBQUUsa0JBQWtCO2FBQ3pCO1NBQ0Y7UUFDRCxNQUFNLEVBQUUsb0JBQWM7S0FDdkIsQ0FBQztJQUNGLE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFrQjtJQUM5RCxPQUFPOzs7Ozs2Q0FLb0MsSUFBSTs2Q0FDSixLQUFLOztvQ0FFZCxPQUFPOzs7R0FHeEMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFrQjtJQUM5RCxPQUFPOzs7YUFHSSxJQUFJO2FBQ0osS0FBSztNQUNaLE9BQU87R0FDVixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNRU0hhbmRsZXIgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuLy8gaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IFNFU19FTUFJTF9GUk9NLCBTRVNfRU1BSUxfVE8sIFNFU19SRUdJT04gfSBmcm9tIFwiLi4vZW52XCI7XG5pbXBvcnQge1xuICBTRVNDbGllbnQsXG4gIFNlbmRFbWFpbENvbW1hbmQsXG4gIFNlbmRFbWFpbENvbW1hbmRJbnB1dCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zZXNcIjtcblxuaWYgKCFTRVNfRU1BSUxfVE8gfHwgIVNFU19FTUFJTF9GUk9NIHx8ICFTRVNfUkVHSU9OKSB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICBcIlBsZWFzZSBhZGQgdGhlIFNFU19FTUFJTF9UTywgU0VTX0VNQUlMX0ZST00gYW5kIFNFU19SRUdJT04gZW52aXJvbm1lbnQgdmFyaWFibGVzIGluIGFuIGVudi5qcyBmaWxlIGxvY2F0ZWQgaW4gdGhlIHJvb3QgZGlyZWN0b3J5XCJcbiAgKTtcbn1cblxudHlwZSBDb250YWN0RGV0YWlscyA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBlbWFpbDogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59O1xuXG5jb25zdCBjbGllbnQgPSBuZXcgU0VTQ2xpZW50KHsgcmVnaW9uOiBcImV1LXdlc3QtMVwiIH0pO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlcjogU1FTSGFuZGxlciA9IGFzeW5jIChldmVudDogYW55KSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiRXZlbnQgXCIsIGV2ZW50KTtcbiAgZm9yIChjb25zdCByZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgIGNvbnN0IHNuc01lc3NhZ2UgPSBKU09OLnBhcnNlKHJlY29yZC5TbnMuTWVzc2FnZSk7XG4gICAgXG4gICAgaWYgKHNuc01lc3NhZ2UuUmVjb3Jkcykge1xuICAgICAgY29uc29sZS5sb2coXCJSZWNvcmQgYm9keSBcIiwgSlNPTi5zdHJpbmdpZnkoc25zTWVzc2FnZSkpO1xuICAgICAgZm9yIChjb25zdCBtZXNzYWdlUmVjb3JkIG9mIHNuc01lc3NhZ2UuUmVjb3Jkcykge1xuICAgICAgICBjb25zdCBzM2UgPSBtZXNzYWdlUmVjb3JkLnMzO1xuICAgICAgICBjb25zdCBzcmNCdWNrZXQgPSBzM2UuYnVja2V0Lm5hbWU7XG4gICAgICAgIC8vIE9iamVjdCBrZXkgbWF5IGhhdmUgc3BhY2VzIG9yIHVuaWNvZGUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMuXG4gICAgICAgIGNvbnN0IHNyY0tleSA9IGRlY29kZVVSSUNvbXBvbmVudChzM2Uub2JqZWN0LmtleS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IG5hbWUsIGVtYWlsLCBtZXNzYWdlIH06IENvbnRhY3REZXRhaWxzID0ge1xuICAgICAgICAgICAgbmFtZTogXCJUaGUgUGhvdG8gQWxidW1cIixcbiAgICAgICAgICAgIGVtYWlsOiBTRVNfRU1BSUxfRlJPTSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBXZSByZWNlaXZlZCB5b3VyIEltYWdlLiBJdHMgVVJMIGlzIHMzOi8vJHtzcmNCdWNrZXR9LyR7c3JjS2V5fWAsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBwYXJhbXMgPSBzZW5kRW1haWxQYXJhbXMoeyBuYW1lLCBlbWFpbCwgbWVzc2FnZSB9KTtcbiAgICAgICAgICBhd2FpdCBjbGllbnQuc2VuZChuZXcgU2VuZEVtYWlsQ29tbWFuZChwYXJhbXMpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIGlzOiBcIiwgZXJyb3IpO1xuICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gc2VuZEVtYWlsUGFyYW1zKHsgbmFtZSwgZW1haWwsIG1lc3NhZ2UgfTogQ29udGFjdERldGFpbHMpIHtcbiAgY29uc3QgcGFyYW1ldGVyczogU2VuZEVtYWlsQ29tbWFuZElucHV0ID0ge1xuICAgIERlc3RpbmF0aW9uOiB7XG4gICAgICBUb0FkZHJlc3NlczogW1NFU19FTUFJTF9UT10sXG4gICAgfSxcbiAgICBNZXNzYWdlOiB7XG4gICAgICBCb2R5OiB7XG4gICAgICAgIEh0bWw6IHtcbiAgICAgICAgICBDaGFyc2V0OiBcIlVURi04XCIsXG4gICAgICAgICAgRGF0YTogZ2V0SHRtbENvbnRlbnQoeyBuYW1lLCBlbWFpbCwgbWVzc2FnZSB9KSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBTdWJqZWN0OiB7XG4gICAgICAgIENoYXJzZXQ6IFwiVVRGLThcIixcbiAgICAgICAgRGF0YTogYE5ldyBpbWFnZSBVcGxvYWRgLFxuICAgICAgfSxcbiAgICB9LFxuICAgIFNvdXJjZTogU0VTX0VNQUlMX0ZST00sXG4gIH07XG4gIHJldHVybiBwYXJhbWV0ZXJzO1xufVxuXG5mdW5jdGlvbiBnZXRIdG1sQ29udGVudCh7IG5hbWUsIGVtYWlsLCBtZXNzYWdlIH06IENvbnRhY3REZXRhaWxzKSB7XG4gIHJldHVybiBgXG4gICAgPGh0bWw+XG4gICAgICA8Ym9keT5cbiAgICAgICAgPGgyPlNlbnQgZnJvbTogPC9oMj5cbiAgICAgICAgPHVsPlxuICAgICAgICAgIDxsaSBzdHlsZT1cImZvbnQtc2l6ZToxOHB4XCI+8J+RpCA8Yj4ke25hbWV9PC9iPjwvbGk+XG4gICAgICAgICAgPGxpIHN0eWxlPVwiZm9udC1zaXplOjE4cHhcIj7inInvuI8gPGI+JHtlbWFpbH08L2I+PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPHAgc3R5bGU9XCJmb250LXNpemU6MThweFwiPiR7bWVzc2FnZX08L3A+XG4gICAgICA8L2JvZHk+XG4gICAgPC9odG1sPiBcbiAgYDtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQoeyBuYW1lLCBlbWFpbCwgbWVzc2FnZSB9OiBDb250YWN0RGV0YWlscykge1xuICByZXR1cm4gYFxuICAgIFJlY2VpdmVkIGFuIEVtYWlsLiDwn5OsXG4gICAgU2VudCBmcm9tOlxuICAgICAgICDwn5GkICR7bmFtZX1cbiAgICAgICAg4pyJ77iPICR7ZW1haWx9XG4gICAgJHttZXNzYWdlfVxuICBgO1xufVxuIl19