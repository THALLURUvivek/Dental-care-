# Builds the multi-page site from shared partials in _build/
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root

$head = Get-Content -Raw (Join-Path $root '_build\head.html')
$foot = Get-Content -Raw (Join-Path $root '_build\foot.html')

$pages = @(
  @{ out='index.html';         key='home';     body='body-home.html';
     title='Lumina Dental Care | Modern Dental Clinic & Smile Studio';
     desc='Lumina Dental Care — premium dental clinic offering implants, orthodontics, cosmetic dentistry and gentle family care with world-class technology.' },
  @{ out='about.html';         key='about';    body='body-about.html';
     title='About Us | Lumina Dental Care';
     desc='The story, values and milestones behind Lumina Dental Care — a clinic built around how patients feel, not just their teeth.' },
  @{ out='services.html';      key='services'; body='body-services.html';
     title='Dental Services & Treatments | Lumina Dental Care';
     desc='Explore implants, cosmetic dentistry, orthodontics, kids dentistry and emergency care — every treatment in one digital clinic.' },
  @{ out='why.html';           key='why';      body='body-why.html';
     title='Why Choose Us | Lumina Dental Care';
     desc='Pain-free technology, transparent pricing, specialist dentists and lifetime aftercare — the Lumina difference in writing.' },
  @{ out='team.html';          key='team';     body='body-team.html';
     title='Our Doctors & Specialists | Lumina Dental Care';
     desc='Meet the board-certified dentists, surgeons and hygienists behind 12,000 happy smiles at Lumina Dental Care.' },
  @{ out='pricing.html';       key='pricing';  body='body-pricing.html';
     title='Pricing & Membership Plans | Lumina Dental Care';
     desc='Transparent membership plans, a published treatment price list, 0% EMI and direct insurance billing at Lumina Dental Care.' },
  @{ out='faq.html';           key='faq';      body='body-faq.html';
     title='Frequently Asked Questions | Lumina Dental Care';
     desc='Straight answers about dental pain, prices, insurance, kids and emergency care — Lumina Dental Care FAQ.' },
  @{ out='appointment.html';   key='none';    body='body-appointment.html';
     title='Book An Appointment | Lumina Dental Care';
     desc='Request a free dental consultation at Lumina Dental Care — callback within 15 minutes, same-day slots available.' },
  @{ out='signin.html';        key='none';    body='body-signin.html';
     title='Sign In | Lumina Dental Care Patient Portal';
     desc='Sign in to the Lumina Dental patient portal to manage appointments, treatment plans and invoices.' },
  @{ out='signup.html';        key='none';    body='body-signup.html';
     title='Create Account | Lumina Dental Care Patient Portal';
     desc='Create your free Lumina Dental patient account — book visits, track treatments and manage your smile journey.' },
  @{ out='forgot.html';        key='none';    body='body-forgot.html';
     title='Reset Password | Lumina Dental Care Patient Portal';
     desc='Reset the password for your Lumina Dental patient account.' },
  @{ out='404.html';           key='none';    body='body-404.html';
     title='Page Not Found (404) | Lumina Dental Care';
     desc='The page you are looking for does not exist — head back home or return to the page you came from.' }
)

$keys = @('home','about','services','why','team','pricing','faq')

# --- patient dashboard pages (app shell: sidebar + topbar) ---
$dashHead = Get-Content -Raw (Join-Path $root '_build\dash-head.html')
$dashFoot = Get-Content -Raw (Join-Path $root '_build\dash-foot.html')

$dashPages = @(
  @{ out='dashboard.html';  key='dashboard';    page='Overview';            body='body-dashboard.html';
     title='Dashboard Overview | Lumina Dental Patient Portal';
     desc='Your oral health snapshot — upcoming visits, activity, health score and quick actions.' },
  @{ out='appointments.html'; key='appointments'; page='Appointments';       body='body-appointments.html';
     title='My Appointments | Lumina Dental Patient Portal';
     desc='Track upcoming and past dental appointments — reschedule or cancel in seconds.' },
  @{ out='treatments.html'; key='treatments';   page='Treatments & Records'; body='body-treatments.html';
     title='Treatments & Records | Lumina Dental Patient Portal';
     desc='Your treatment timeline, X-rays, prescriptions and clinical documents in one place.' },
  @{ out='invoices.html';   key='invoices';     page='Invoices & Payments';  body='body-invoices.html';
     title='Invoices & Payments | Lumina Dental Patient Portal';
     desc='Review bills, download receipts and manage payment preferences for your dental care.' },
  @{ out='profile.html';    key='profile';      page='Profile & Settings';   body='body-profile.html';
     title='Profile & Settings | Lumina Dental Patient Portal';
     desc='Update your personal details, security settings and notification preferences.' }
)

$dashKeys = @('dashboard','appointments','treatments','invoices','profile')

foreach ($p in $pages) {
  $body = Get-Content -Raw (Join-Path $root ('_build\' + $p.body))
  $html = $head + "`r`n`r`n<!-- ============ PAGE CONTENT ============ -->`r`n`r`n" + $body + "`r`n`r`n" + $foot

  $html = $html.Replace('{{TITLE}}', $p.title).Replace('{{DESC}}', $p.desc)

  foreach ($k in $keys) {
    if ($k -eq $p.key) { $val = 'active' } else { $val = '' }
    $html = $html.Replace('{{A:' + $k + '}}', $val)
  }

  Set-Content -Path (Join-Path $root $p.out) -Value $html -Encoding UTF8
  Write-Host ('built -> ' + $p.out)
}

foreach ($p in $dashPages) {
  $body = Get-Content -Raw (Join-Path $root ('_build\' + $p.body))
  $html = $dashHead + "`r`n`r`n<!-- ============ DASH CONTENT ============ -->`r`n`r`n" + $body + "`r`n`r`n" + $dashFoot

  $html = $html.Replace('{{TITLE}}', $p.title).Replace('{{DESC}}', $p.desc).Replace('{{PAGE}}', $p.page)

  foreach ($k in $keys) { $html = $html.Replace('{{A:' + $k + '}}', '') }
  foreach ($k in $dashKeys) {
    if ($k -eq $p.key) { $val = 'active' } else { $val = '' }
    $html = $html.Replace('{{A:' + $k + '}}', $val)
  }

  Set-Content -Path (Join-Path $root $p.out) -Value $html -Encoding UTF8
  Write-Host ('built -> ' + $p.out)
}
