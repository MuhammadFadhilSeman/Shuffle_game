from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

# Daftar pertanyaan random bahasa Indonesia
QUESTIONS_ID = [
    "Pernah gak sih lu ngerasa salah jurusan?",
    "Apa hal paling memalukan yang pernah lu lakuin di depan gebetan?",
    "Kalau lu bisa memutar waktu, lu mau balik ke umur berapa dan kenapa?",
    "Sebutin satu rahasia yang belum pernah lu ceritain ke siapa-siapa di sini!",
    "Siapa orang yang paling pengen lu tonjok saat ini?",
    "Menurut lu, di antara kita siapa yang bakal nikah duluan?",
    "Apa ketakutan terbesar lu yang terdengar konyol?",
    "Pernah bohong soal apa ke orang tua minggu ini?",
    "Lebih milih miskin tapi bahagia atau kaya tapi kesepian?",
    "Hal apa yang bikin lu langsung ilfeel sama orang?",
    "Mantan mana yang paling susah dilupain?",
    "Pernah nggak sih lu pura-pura sibuk main HP padahal nggak ada yang nge-chat?",
    "Apa hal terbodoh yang pernah lu lakuin demi cinta?",
    "Kalau hidup lu dibikin film, siapa aktor/aktris yang cocok meranin lu?",
    "Sebutin satu hal yang lu sesalin sampai sekarang!",
    "Siapa orang di circle ini yang paling sering ngutang tapi pura-pura lupa?",
    "Kapan terakhir kali lu nangis dan gara-gara apa?",
    "Pernah stalk IG mantan pakai fake account nggak?",
    "Kalau lu tiba-tiba dapat uang 1 milyar besok, apa yang pertama kali lu beli?",
    "Apa gosip paling aneh yang pernah lu denger tentang diri lu sendiri?",
    "Dari semua orang di sini, siapa yang paling cocok lu jadiin pacar kalau terpaksa?",
    "Pernah ngerasa iri banget nggak sama pencapaian teman sendiri?",
    "Sebutin satu kebiasaan jorok lu yang nggak ada orang lain yang tahu!",
    "Siapa orang yang paling sering bikin lu kesal tapi tetap lu temenin?",
    "Pernah ghosting orang nggak? Kenapa?",
    "Sebutin nama orang yang lu block di WhatsApp dan alasannya!",
    "Apa hal paling nekat yang pernah lu lakuin pas lagi mabuk/ngantuk berat?",
    "Lebih milih diselingkuhin atau nyelingkuhin?",
    "Pernah naksir sama pacar teman sendiri nggak?",
    "Kalau lu cuma punya waktu hidup 24 jam lagi, lu mau ngapain?",
    "Pernah diam-diam ngebaca chat di HP pacar atau teman lu?",
    "Apa pendapat lu yang paling kontroversial tentang makanan?",
    "Menurut lu, apa sifat paling toxic yang lu punya?",
    "Siapa di antara kita yang paling gampang dibohongin?",
    "Pernah pura-pura sakit buat ngehindarin acara tongkrongan nggak?",
    "Apa pesan terakhir yang lu kirim di WhatsApp sebelum ini?",
    "Kalau disuruh hapus satu aplikasi di HP selamanya, lu bakal hapus apa?",
    "Pernah nggak sih lu ngerasa lu tuh sebenarnya orang paling pintar di circle ini?",
    "Pilih mana: nggak bisa main sosmed sebulan atau nggak bisa denger lagu sebulan?",
    "Apa aib masa kecil lu yang sampai sekarang masih sering diomongin keluarga?",
    "Siapa cinta pertama lu dan apa kabar dia sekarang?",
    "Sebutin satu hal ilegal yang pernah lu lakuin tanpa ketahuan!",
    "Kalau lu harus tukar nasib sama salah satu dari kita, lu pilih siapa?",
    "Apa pujian terbesar yang pernah lu terima tapi sebenarnya lu ngerasa nggak pantes?",
    "Pernah nggak kepikiran pengen lari dari rumah dan hilang gitu aja?"
]

# Daftar pertanyaan random bahasa Inggris
QUESTIONS_EN = [
    "Have you ever felt like you chose the wrong major or career path?",
    "What's the most embarrassing thing you've done in front of a crush?",
    "If you could turn back time, what age would you return to and why?",
    "Tell us one secret you've never told anyone here!",
    "Who is the person you want to punch the most right now?",
    "Who among us do you think will get married first?",
    "What is your biggest, most ridiculous fear?",
    "What did you lie to your parents about this week?",
    "Would you rather be poor but happy, or rich but lonely?",
    "What is an instant turn-off for you?",
    "Which ex is the hardest for you to forget?",
    "Have you ever pretended to be busy on your phone when no one was texting you?",
    "What is the stupidest thing you've ever done for love?",
    "If your life were a movie, who would play you?",
    "Name one thing you deeply regret to this day!",
    "Who in this circle borrows money the most but pretends to forget?",
    "When was the last time you cried and why?",
    "Have you ever stalked an ex using a fake account?",
    "If you suddenly got $1 million tomorrow, what's the first thing you'd buy?",
    "What's the weirdest rumor you've heard about yourself?",
    "If you were forced to date someone in this room, who would it be?",
    "Have you ever been extremely jealous of a friend's success?",
    "Name one gross habit you have that no one else knows about!",
    "Who annoys you the most, but you still hang out with them?",
    "Have you ever ghosted someone? Why?",
    "Name someone you blocked on WhatsApp and the reason why!",
    "What's the most reckless thing you've done while sleep-deprived or drunk?",
    "Would you rather be cheated on or be the cheater?",
    "Have you ever had a crush on a friend's partner?",
    "If you only had 24 hours left to live, what would you do?",
    "Have you ever secretly read a friend's or partner's chats?",
    "What is your most controversial opinion about food?",
    "What do you think is your most toxic trait?",
    "Who among us is the most gullible?",
    "Have you ever faked being sick to avoid hanging out?",
    "What was the last message you sent on WhatsApp before this?",
    "If you had to delete one app forever, which one would it be?",
    "Do you ever secretly think you're the smartest person in this friend group?",
    "Choose: No social media for a month, or no music for a month?",
    "What childhood embarrassment do your parents still talk about?",
    "Who was your first love, and how are they doing now?",
    "Name one illegal thing you did without getting caught!",
    "If you had to swap lives with one of us, who would you pick?",
    "What's the biggest compliment you've received that you felt you didn't deserve?",
    "Have you ever thought about running away and just disappearing?"
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    lang = request.args.get('lang', 'id')
    questions_list = QUESTIONS_EN if lang == 'en' else QUESTIONS_ID
    
    # Return a shuffled copy
    shuffled_questions = list(questions_list)
    random.shuffle(shuffled_questions)
    return jsonify(shuffled_questions)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
