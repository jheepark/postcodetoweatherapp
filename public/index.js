$(function() {
  let maintemp
  let rowData
  let zip

  function set_maintemp(x) {
    maintemp = x;
  }
  function setrowData(x) {
    rowData = x;
  }
  function setzip(x) {
    rowData = x;
  }

  function getWeather(zip) {
    setzip(zip)
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/weather?zip=${zip.responses[1].answer},au&units=metric&appid=970b9600124bb7d909f46b5351782f1a`,
      method: 'GET',
      success: function(data) {
        set_maintemp(data);
      },
      complete: function() {
        let $responses = $('#postcode');
        let content = '';
        content += getRow(zip);
        $responses.append(content);
      }
    })
  }

  function getRow(response) {
    var tpl = '<tr class="bottom"><td>';
    tpl += response.phone || 'pending...' + '</td>';
    if (response.responses[0].recordingUrl) {
      tpl += `<td><audio controls="controls" class="audio">
<source src=${response.responses[0].recordingUrl} type="audio/mp3">
</audio></td>`;
    } else {
      tpl += '<td>N/A</td>';
    }
    if (response.responses[1].answer) {
      tpl += `<td>${response.responses[1].answer}</td>`
    } else {
      tpl += '<td>N/A</td>';
    }
    if(maintemp.weather[0].description){
      if (maintemp.weather[0].description === 'clear sky') {
        tpl += `<td><div class="icon sunny">
    <div class="sun">
      <div class="rays"></div>
    </div>
  </div></td>`
  } else if (maintemp.weather[0].description === 'scattered clouds') {
        tpl += `<td><div class="icon cloudy">
    <div class="cloud"></div>
    <div class="cloud"></div>
  </div></td>`
} else if (maintemp.weather[0].description === 'broken clouds') {
      tpl += `<td><div class="icon cloudy">
  <div class="cloud"></div>
  <div class="cloud"></div>
</div></td>`
} else if (maintemp.weather[0].description === 'few clouds') {
      tpl += `<td><div class="icon cloudy">
  <div class="cloud"></div>
  <div class="cloud"></div>
</div></td>`
  } else if (maintemp.weather[0].description === 'shower rain') {
        tpl += `<td><div class="icon sun-shower">
    <div class="cloud"></div>
    <div class="sun">
      <div class="rays"></div>
    </div>
    <div class="rain"></div>
  </div></td>`
  } else if (maintemp.weather[0].description === 'rain') {
        tpl += `<td><div class="icon rainy">
    <div class="cloud"></div>
    <div class="rain"></div>
  </div></td>`
  } else if (maintemp.weather[0].description === 'thunderstorm') {
        tpl += `<td><div class="icon thunder-storm">
    <div class="cloud"></div>
    <div class="lightning">
      <div class="bolt"></div>
      <div class="bolt"></div>
    </div>
  </div></td>`
  } else if (maintemp.weather[0].description === 'snow') {
        tpl += `<td><div class="icon flurries">
    <div class="cloud"></div>
    <div class="snow">
      <div class="flake"></div>
      <div class="flake"></div>
    </div>
  </div></td>`
      } else {
        tpl += `<td>${maintemp.weather[0].description}</td>`
      }
    }

    tpl += `<td>${maintemp.main.temp}°C</td>`
    tpl += '</tr>';
    return tpl;
  }

  // add text responses to a table
  function freeText(results) {
    for (var i = 0, l = results.length; i < l; i++) {
      var postcode = results[i];
      getWeather(postcode)
      setrowData(postcode);
    }
  }

  // Load current results from server
  $.ajax({url: '/results', method: 'GET'}).done(function(data) {
    // Update charts and tables
    $('#total').html(data.results.length);
    freeText(data.results);
  }).fail(function(err) {
    console.log(err);
    alert('failed to load results data :(');
  });
});
