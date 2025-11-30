# 🌱 **Mood Gardens**
### *An AI-generated visual diary with encryption, aggregation, and emotional landscape generation*

Mood Gardens transforms personal diary entries into **AI-generated emotional gardens**.  
It combines **React + TypeScript**, **Node/Express + GraphQL**, **Prisma + Postgres**, **Redis + BullMQ workers**, **AES-GCM encryption**, and **OpenAI image generation**.

This repository is designed as a **portfolio flagship project**, showcasing full-stack engineering, distributed systems, security, and cloud DevOps.

---

## 🌟 Features

### 🧠 AI Mood Analysis
- Semantic mood extraction from diary entries  
- Weighted emotion scoring  
- Dynamic prompt generation for OpenAI image models  

### 🌺 Generative Mood Gardens
- AI-generated images based on emotional signatures  
- Custom ambience layers, palettes, and generative rules  
- Daily / weekly / monthly / yearly gardens  

### 🔐 Zero-Trust Encryption Model
- AES-GCM encryption for all diary entries  
- Per-user Data Encryption Keys (DEKs)  
- Keys encrypted via Azure Key Vault  
- No plaintext diary content stored anywhere  

### 🗓 Time-Period Aggregation Engine
- Daily → Weekly → Monthly → Yearly summaries  
- BullMQ workers for background processing  
- Retries, idempotency, and progress reporting  
- Timezone-aware with custom “day rollover” per user  

### 👤 Elegant Frontend
- React + Vite + TypeScript + Tailwind CSS  
- Apollo Client for GraphQL  
- Live job progress for garden generation  
- Secure login & Google OAuth  
- Mobile-friendly UI  
- Hosted on Vercel (mymoodgardens.com)

### 🧰 Strong Backend
- Node.js + Express + Apollo GraphQL  
- Prisma ORM  
- PostgreSQL (Azure)  
- Redis queue engine  
- Cloudinary for image uploads  
- Hosted on Azure Container Apps

---

## 🏗 Architecture Overview

Frontend (React, Vite, TS)
|
| GraphQL over HTTPS
v
API Container (Express + Apollo + Prisma)
|
| BullMQ Jobs
v
Redis Queue -----> Worker Containers (Garden Worker, Aggregation Worker)
|
v
PostgreSQL (Azure)

Cloudinary (Image Storage)
Azure Key Vault (Encrypted User Keys)


sequenceDiagram
    autonumber

    participant U as User
    participant F as Frontend (React)
    participant A as API (GraphQL)
    participant DB as PostgreSQL
    participant Q as BullMQ Queue<br/>("garden-generate")
    participant W as Garden Worker
    participant KV as Key Vault
    participant OA as OpenAI Image API
    participant CL as Cloudinary

    U->>F: Write & submit diary entry
    F->>A: GraphQL mutation: submitDiaryEntry(text)
    
    Note over A,DB: 1) Generate per-user DEK if needed<br/>2) Encrypt text with AES-GCM
    A->>KV: (Optional) Fetch / unwrap user DEK
    KV-->>A: Decrypted DEK
    A->>DB: Store encrypted diary entry + metadata

    Note over A,Q: Create Garden (PENDING) and queue job
    A->>DB: Create Garden record (status=PENDING, progress=0)
    A->>Q: Add job: { gardenId }

    F-->>U: Show “Garden generating…” state

    %% Worker side
    Q->>W: Deliver job { gardenId }
    W->>DB: Fetch Garden + related diary/summary
    W->>KV: Fetch & unwrap DEK
    KV-->>W: Decrypted DEK
    W->>W: Decrypt diary / summary (AES-GCM)
    W-->>DB: Update Garden progress (10–30%)

    Note over W: Analyse mood → valence, arousal, emotions, tags
    W->>W: Build Mood object + prompt components
    W-->>DB: Update Garden progress (50%)

    W->>OA: Send prompt for image generation
    OA-->>W: Return generated image (binary buffer)
    W-->>DB: Update Garden progress (75%)

    W->>CL: Upload image buffer
    CL-->>W: Return image URL + publicId

    Note over W,DB: Save final summary, palette, status=READY
    W-->>DB: Update Garden with imageUrl,<br/>publicId, palette, summary,<br/>status=READY, progress=100%

    F->>A: Poll / subscribe for Garden status
    A->>DB: Get Garden
    DB-->>A: Garden (status=READY, imageUrl,…)
    A-->>F: Garden data
    F-->>U: Display finished Mood Garden 🌱


---

## Security Highlights

- AES-GCM encryption (256-bit)  
- Unique encrypted DEK per user  
- Diary text *never* exists unencrypted in the DB  
- Secure cookies (`SameSite=None`, `Secure`, domain-scoped)  
- Sanitized public share pages  
- Strict GraphQL validation  

---

##  Deployment & DevOps

- Docker multi-stage builds  
- GitHub Actions CI/CD  
- Push → Build → Push to Docker Hub → Deploy to Azure  
- Independent scaling for API vs workers  
- Vercel hosting for the frontend  
- Environment secrets stored in Azure Key Vault + Vercel  

---

## 📂 Tech Stack

**Frontend:**  
React, Vite, TypeScript, Tailwind, Apollo Client  

**Backend:**  
Node.js, Express, GraphQL, Prisma, PostgreSQL  

**AI:**  
OpenAI API (image + text), custom prompt engine  

**Workers:**  
Redis, BullMQ, multi-container worker system  

**Cloud:**  
Azure Container Apps, Azure Redis, Azure Postgres, Azure Key Vault  

**Storage:**  
Cloudinary (image hosting), PostgreSQL (structured data)  

**DevOps:**  
Docker, Docker Hub, GitHub Actions  

---

## 🎨 Example Output

<img width="150" height="150" alt="Birds" src="https://github.com/user-attachments/assets/121e2897-f0b3-4874-91ff-ebaf7e4c8df1" />
<img width="150" height="150" alt="Whirl" src="https://github.com/user-attachments/assets/b0033e2b-3345-4b5b-9b37-ab3ef87d95ed" />
<img width="150" height="150" alt="Trippy" src="https://github.com/user-attachments/assets/cd52dc88-af20-4d47-92fa-7d161bfa7807" />
<img width="150" height="150" alt="Castle" src="https://github.com/user-attachments/assets/3818e9c1-0fab-4434-a71b-5ffee9366e42" />
<img width="150" height="150" alt="Love" src="https://github.com/user-attachments/assets/34695a06-297d-4807-bb3a-39e8f0540b49" />
<img width="150" height="150" alt="Frogs" src="https://github.com/user-attachments/assets/e84046ff-00ec-4520-9af9-c18c4d533a36" />
<img width="150" height="150" alt="Moon" src="https://github.com/user-attachments/assets/4b396ed0-981d-4ff4-b9fd-63a8917407ff" />
<img width="150" height="150" alt="Starry" src="https://github.com/user-attachments/assets/1a46f16d-3eb2-491e-81aa-a6576b3fbfe2" />
<img width="150" height="150" alt="Pool" src="https://github.com/user-attachments/assets/157c81dc-3440-42f5-859d-d48205b7af04" />
<img width="150" height="150" alt="Lavender" src="https://github.com/user-attachments/assets/eb9b24a3-188e-4371-bef6-0abddcc207d7" />
<img width="150" height="150" alt="Darkness" src="https://github.com/user-attachments/assets/77710195-24e4-4e93-8d09-2ceb7370d966" />
<img width="150" height="150" alt="Thunder" src="https://github.com/user-attachments/assets/5506a812-2066-434a-815e-3192b25b1983" />


---

## 👤 About the Developer

Hi — I’m **Alex Crabbe**, a full-stack developer with a background in **Biomedical Physics (MRI simulations)**.

Mood Gardens demonstrates:

- End-to-end encryption  
- Distributed background processing  
- AI image generation pipelines  
- Cloud-native deployment  
- Complex frontend + backend integration  
- Secure authentication and cookie flows  

**Portfolio:** https://www.alex-crabbe.vercel.app  
**Project:** https://www.mymoodgardens.com  

---

## 📩 Contact

**Email:** alexrobincrabbe@gmail.com  
**LinkedIn:** https://www.linkedin.com/in/alex-crabbe






