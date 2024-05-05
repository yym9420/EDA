#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const eda_app_stack_1 = require("../lib/eda-app-stack");
const app = new cdk.App();
new eda_app_stack_1.EDAAppStack(app, "EDAStack", {
    env: { region: "eu-west-1" },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRhLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVkYS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQXFDO0FBQ3JDLG1DQUFtQztBQUNuQyx3REFBbUQ7QUFFbkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSwyQkFBVyxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUU7SUFDL0IsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtDQUM3QixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgXCJzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXJcIjtcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IEVEQUFwcFN0YWNrIH0gZnJvbSBcIi4uL2xpYi9lZGEtYXBwLXN0YWNrXCI7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5uZXcgRURBQXBwU3RhY2soYXBwLCBcIkVEQVN0YWNrXCIsIHtcbiAgZW52OiB7IHJlZ2lvbjogXCJldS13ZXN0LTFcIiB9LFxufSk7XG4iXX0=