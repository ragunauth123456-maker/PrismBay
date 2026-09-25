"""Original 36-second silent, captions-first educational short for verified $49 toolkit."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess, json
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.run'/'stakeholder-short-20260924'
WORK.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'public'/'videos'/'prismbay-stakeholder-evidence-toolkit-20260924.mp4'
OUT.parent.mkdir(parents=True,exist_ok=True)
W,H=720,1280
NAVY,TEAL,WHITE,MUTED='#0B152A','#64E5CD','#F4FAFF','#C0D2E2'
REG,BOLD='C:/Windows/Fonts/segoeui.ttf','C:/Windows/Fonts/segoeuib.ttf'
def font(sz,b=False): return ImageFont.truetype(BOLD if b else REG,sz)
def label(d,s,x,y,sz=27,c=MUTED,b=False):d.text((x,y),s,font=font(sz,b),fill=c)
def wrap(d,s,sz,width,b=False):
    lines=[]; line=''
    for word in s.split():
        test=(line+' '+word).strip()
        if line and d.textbbox((0,0),test,font=font(sz,b))[2]>width: lines.append(line);line=word
        else:line=test
    return lines+[line]
def body(d,s,x,y,width=582,sz=28,step=44,c=MUTED):
    for ln in wrap(d,s,sz,width):label(d,ln,x,y,sz,c);y+=step
def panel(d,heading,entries):
    y=686
    d.rounded_rectangle((54,y,666,y+359),radius=24,fill='#132A44',outline='#357084',width=2)
    label(d,heading,82,y+25,26,TEAL,True)
    for j,item in enumerate(entries):
        yy=y+94+j*77
        if j:d.line((82,yy-16,637,yy-16),fill='#335369',width=2)
        label(d,f'0{j+1}',82,yy,25,TEAL,True);body(d,item,142,yy-1,466,25,32,WHITE)
DATA=[
('EXECUTIVE ENGAGEMENT',['A CONTACT LIST','IS NOT AN','ENGAGEMENT PLAN.'],'A stakeholder name is only a beginning. Track relationships, responsibilities and follow-through.','THE MISSING LINKS',['Relationship context','A named engagement owner','Recorded commitments']),
('STEP 01  /  PRIORITIZE',['MAP INFLUENCE.','MAP INTEREST.','SET A PLAN.'],'Use a consistent matrix to record who needs engagement and why.','A WORKING REGISTER',['Influence and interest','Engagement objective','Next contact and owner']),
('STEP 02  /  RECORD',['EVERY PROMISE','NEEDS AN','ACCOUNTABLE OWNER.'],'A meeting without a recorded action leaves decisions and commitments exposed.','COMMITMENT TRACKER',['Action agreed and evidence','Named owner and due date','Follow-up and closure status']),
('STEP 03  /  ESCALATE',['MAKE OPEN','ISSUES VISIBLE','BEFORE THEY GROW.'],'Separate pending work from completed actions. Record unresolved issues and escalation owners.','MANAGEMENT CONTROLS',['Open issue and materiality','Responsible decision owner','Documented next action']),
('STEP 04  /  REPORT',['MAKE THE','EXECUTIVE BRIEF','DECISION-READY.'],'Your leadership team needs evidence, exceptions and decisions, not another contact spreadsheet.','A USEFUL MONTHLY BRIEF',['Progress against commitments','Exceptions requiring attention','Decision, owner and deadline']),
('PRISMBAY / EDITABLE TOOLS',['TURN THE PLAN','INTO AN','EDITABLE SYSTEM.'],'Executive Stakeholder Mapping Toolkit. A PDF guide, Excel tracking workbook and Word executive brief.','ONE-TIME  $49 USD',['PDF: implementation guide','XLSX: stakeholder register','DOCX: executive brief template'])
]
def slide(i,row):
    eye,title,description,heading,entries=row;im=Image.new('RGB',(W,H),NAVY);d=ImageDraw.Draw(im)
    for y in range(H):
        f=y/H;d.line((0,y,W,y),fill=(int(10+8*f),int(23+15*f),int(45+18*f)))
    d.ellipse((490,-200,1000,310),outline='#1B5F68',width=4)
    d.rounded_rectangle((53,55,270,115),radius=12,fill='#163B47')
    label(d,'PRISMBAY  AI',72,68,27,TEAL,True)
    label(d,f'0{i+1} / 06',564,72,27,MUTED,True)
    label(d,eye,55,179,25,TEAL,True)
    yy=257
    for s in title:
        sz=56
        while d.textbbox((0,0),s,font=font(sz,True))[2]>610:sz-=2
        label(d,s,54,yy,sz,WHITE,True);yy+=83
    body(d,description,56,527,596,28,45)
    panel(d,heading,entries)
    if i==5:
        d.rounded_rectangle((52,1070,667,1150),radius=18,fill=TEAL)
        label(d,'PROFILE LINK  /  EXECUTIVE TOOLKITS',75,1090,24,NAVY,True)
    else:label(d,'FREE LESSON  /  PRISMBAY AI',57,1099,25,MUTED,True)
    label(d,'ORIGINAL EDUCATIONAL VIDEO',55,1195,21,'#95ABBD')
    for j in range(6):
        x=55+104*j;d.rounded_rectangle((x,1245,x+85,1255),radius=5,fill=TEAL if j<=i else '#2A475E')
    f=WORK/f'slide-{i+1:02d}.png';im.save(f,optimize=True);return f
def main():
    slides=[slide(i,row) for i,row in enumerate(DATA)]
    args=['ffmpeg','-hide_banner','-loglevel','error','-y']
    for s in slides:args+=['-loop','1','-framerate','24','-t','6','-i',str(s)]
    parts=[]
    for i in range(6):
        parts.append(f"[{i}:v]scale=720:1280,zoompan=z='min(zoom+0.0004,1.06)':d=1:s=720x1280:fps=24,trim=duration=6,setpts=PTS-STARTPTS,fade=t=in:st=0:d=0.25,fade=t=out:st=5.75:d=0.25[v{i}]")
    parts.append(''.join(f'[v{i}]' for i in range(6))+'concat=n=6:v=1:a=0[v]')
    args+=['-filter_complex',';'.join(parts),'-map','[v]','-c:v','libx264','-preset','fast','-crf','22','-r','24','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT)]
    subprocess.run(args,check=True,timeout=180)
    probe=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,width,height','-of','json',str(OUT)],check=True,capture_output=True,text=True,timeout=15)
    print('RENDER_OK',probe.stdout.strip(),'PATH',OUT)
if __name__=='__main__':main()
