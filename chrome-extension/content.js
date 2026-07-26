// Domain Property Grabber - Content Script
// Runs on domain.com.au listing pages

(function() {
  // Only run on listing pages (have a numeric ID at end of URL)
  if (!window.location.pathname.match(/\d{5,}$/)) return;

  // Wait for page to fully load
  function init() {
    // Check if it's a rental listing page
    var priceEl = document.querySelector('[data-testid="listing-details__summary-title"]') || 
                  document.querySelector('.listing-details__summary-title') ||
                  document.querySelector('h1');
    if (!priceEl) return;

    // Create the save button
    var btn = document.createElement('div');
    btn.id = 'relo-grab-btn';
    btn.innerHTML = '<button id="relo-grab-action">🏠 Save to Tracker</button><div id="relo-grab-status"></div>';
    document.body.appendChild(btn);

    document.getElementById('relo-grab-action').addEventListener('click', grabAndSave);
  }

  function grabAndSave() {
    var status = document.getElementById('relo-grab-status');
    status.textContent = 'Grabbing details...';
    status.style.color = '#f59e0b';

    try {
      var data = extractData();
      if (!data.address) {
        status.textContent = '❌ Could not find address';
        status.style.color = '#ef4444';
        return;
      }

      // Copy to clipboard as JSON for pasting into tracker
      var json = JSON.stringify(data);
      navigator.clipboard.writeText(json).then(function() {
        status.innerHTML = '✅ Copied! Go to tracker → Houses → paste in URL field';
        status.style.color = '#22c55e';
        
        // Also try to open tracker with data in URL hash
        var trackerUrl = 'https://mprater97.github.io/International_relocation/#addhouse=' + encodeURIComponent(json);
        
        // Show the extracted data for confirmation
        var preview = document.createElement('div');
        preview.id = 'relo-grab-preview';
        preview.innerHTML = '<strong>' + data.address + '</strong><br>' +
          data.beds + ' bed | ' + data.baths + ' bath | ' + data.cars + ' car | $' + data.rent + '/wk<br>' +
          '<a href="' + trackerUrl + '" target="_blank" style="color:#3b82f6;font-weight:bold">→ Open in Tracker</a>';
        
        var existing = document.getElementById('relo-grab-preview');
        if (existing) existing.remove();
        document.getElementById('relo-grab-btn').appendChild(preview);
      });

    } catch(e) {
      status.textContent = '❌ Error: ' + e.message;
      status.style.color = '#ef4444';
    }
  }

  function extractData() {
    var data = {
      address: '',
      suburb: '',
      rent: 0,
      beds: 0,
      baths: 0,
      cars: 0,
      image: '',
      link: window.location.href,
      features: []
    };

    // Try __NEXT_DATA__ first (most reliable)
    var nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
      try {
        var json = JSON.parse(nextData.textContent);
        var listing = json.props?.pageProps?.listingDetail || json.props?.pageProps?.listing || {};
        if (listing.addressParts) {
          data.address = (listing.addressParts.streetNumber || '') + ' ' + (listing.addressParts.street || '');
          data.suburb = listing.addressParts.suburb || '';
        }
        if (listing.price) data.rent = parseInt(listing.price.replace(/[^0-9]/g, '')) || 0;
        if (listing.bedrooms) data.beds = listing.bedrooms;
        if (listing.bathrooms) data.baths = listing.bathrooms;
        if (listing.carspaces) data.cars = listing.carspaces;
        if (listing.photos && listing.photos[0]) data.image = listing.photos[0].fullUrl || listing.photos[0].url || '';
      } catch(e) { /* fallback to DOM */ }
    }

    // Fallback: parse from URL
    if (!data.address) {
      var urlMatch = window.location.pathname.match(/\/([^/]+)-(\d+)$/);
      if (urlMatch) {
        var parts = urlMatch[1].split('-');
        var vicIdx = parts.indexOf('vic');
        if (vicIdx > 0) {
          var suburbPart = parts[vicIdx - 1];
          var addressParts = parts.slice(0, vicIdx - 1);
          data.address = addressParts.map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
          data.suburb = suburbPart.charAt(0).toUpperCase() + suburbPart.slice(1);
        }
      }
    }

    // Fallback: DOM scraping for features
    if (!data.beds) {
      var features = document.querySelectorAll('[data-testid="property-features__feature"], [data-testid="property-features"] span, .listing-details__listing-summary-features span');
      features.forEach(function(f) {
        var txt = f.textContent.trim();
        if (txt.match(/\d/) && txt.toLowerCase().includes('bed')) data.beds = parseInt(txt);
        if (txt.match(/\d/) && txt.toLowerCase().includes('bath')) data.baths = parseInt(txt);
        if (txt.match(/\d/) && (txt.toLowerCase().includes('car') || txt.toLowerCase().includes('parking'))) data.cars = parseInt(txt);
      });
    }

    // Get price from DOM
    if (!data.rent) {
      var priceEls = document.querySelectorAll('[data-testid="listing-details__summary-title"], .listing-details__summary-title, h1');
      priceEls.forEach(function(el) {
        var txt = el.textContent;
        var priceMatch = txt.match(/\$\s*([\d,]+)\s*(?:per\s*week|pw|\/wk|\/week|p\/w)/i);
        if (priceMatch) data.rent = parseInt(priceMatch[1].replace(/,/g, ''));
        // Also try just a dollar amount
        if (!data.rent) {
          var simpleMatch = txt.match(/\$([\d,]+)/);
          if (simpleMatch) data.rent = parseInt(simpleMatch[1].replace(/,/g, ''));
        }
      });
    }

    // Get main image
    if (!data.image) {
      var ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) data.image = ogImage.content;
      if (!data.image) {
        var mainImg = document.querySelector('[data-testid="listing-details__photo-gallery"] img, .listing-details__photo-gallery img, picture img');
        if (mainImg) data.image = mainImg.src;
      }
    }

    // Get property features (garden, pool, etc)
    var featureEls = document.querySelectorAll('[data-testid="expander-wrapper"] li, .listing-details__features li, .property-features__feature-text');
    featureEls.forEach(function(el) {
      var txt = el.textContent.trim().toLowerCase();
      if (txt.includes('garden') || txt.includes('courtyard')) data.features.push('garden');
      if (txt.includes('pool') || txt.includes('swimming')) data.features.push('pool');
      if (txt.includes('air con') || txt.includes('heating') || txt.includes('split system')) data.features.push('ac');
      if (txt.includes('dishwasher')) data.features.push('dishwasher');
    });

    return data;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 1000); // Give React time to render
  }
})();
