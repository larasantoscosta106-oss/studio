# **App Name**: Descarrego Digital

## Core Features:

- Data Input: Allow the user to input values for each period (Morning, Afternoon, Night) and Group.
- Commission Calculation: Automatically calculate the commission based on the input values (40% for Morning/Afternoon/Night, 30% for Groups).
- Final Balance Calculation: Calculate the final balance for each column (Input - Commission - Prizes) and the daily total (sum of all columns).
- Negative Value Alert: Warn the user and highlight in red if Prizes or Commission exceed the Input value, preventing negative results.
- Data Persistence: Implement client-side persistence (such as localStorage) for settings, data between sessions, and for export/import of the data as JSON.
- PDF Export: Provide the ability to export the data as a PDF file.
- Dynamic Commission Settings: Enable users to adjust the commission percentages for Morning/Afternoon/Night and Groups through a settings tool. This allows for customized commission structures to be accommodated within the application.

## Style Guidelines:

- Primary color: Deep sky blue (#3EB489) for a calm, reliable, and professional look.
- Background color: Light gray (#F0F8FF), creating a clean and neutral canvas that highlights the data.
- Accent color: Soft Green (#90EE90) for positive balance indications and highlights.
- Body and headline font: 'PT Sans' (sans-serif) for a clean, modern, and readable interface.
- Use simple, intuitive icons to represent different actions and categories within the application.
- Implement a clear, tabular layout for easy data input and review, ensuring the application is responsive across devices.
- Use subtle transitions for feedback, e.g. a brief highlight upon completion of calculation, but keep it simple to keep the attention on the data itself.