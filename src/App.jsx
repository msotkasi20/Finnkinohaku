import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {

  //luodaan tilamuuttuja 
  const [areas, setAreas] = useState([]) //tehdään tyhjä array tiedoille

  //luodaan rekursiivinen funktio (kutsuu itseään), ei tarvi tietää kuinka monta kerrosta lapsia on, 
  // koska kutsuu itseään ja käy kaikki kerrokset läpi. Tarvitsee objektiksi muutetun xml:n (ed.funktio)
  const xmlToJson = useCallback((node) => { //prosessoi xml:län. (node = lapsi!)

    const json = {}                   //luodaan json objekti muuttuja

    let children = [...node.children] //tekee arrayn mahdollisille lapsille (tyhjä, jos ei lapsia)
    //console.log(node.nodeName)      //tulostaa nodejen nimet käsittelyjärjestyksessä
    //console.log(node.innerHTML)     //tulostaa sisällöt

    if (!children.length) return node.innerHTML //jos lapsia arrayssa nolla, palautetaan viimeisen lapsen value

    for (let child of children) {     //jos on lapsia, prosessoidaan luupilla
      //xmlToJson(child)
      const hasSiblings = children.filter( c => c.nodeName === child.nodeName).length > 1 //halutaan tietää ovatko sisaruksia vai lapsia

      if (hasSiblings){               //käy läpi xml:n, lukee arvot, luo kentät alkup. nodeNameista, sijoittaa arvot
        if (json[child.nodeName] === undefined) {
          json[child.nodeName] = [xmlToJson(child)] //jos ei ole vielä arrayta, tehdään array objekteista ja arvoista, json objekti voi sisältää toisen json objektin
        } else {
          json[child.nodeName].push(xmlToJson(child)) //jos array on, laitetaan uusi lapsi sinne
        }
      } else {                        //jos ei ole sisaruksia, päästään prosessoimaan lapsi kyseisestä lapsesta
        json[child.nodeName] = xmlToJson(child) //child.nodeName luo avaimet (key) jsoniin
      }
    }
    return json                        //palauttaa ainakin osan jsonista, tai arvon jos on viimeinen lapsi
  }, [])

  //siirrettään tämä funktio tähän, koska laitettiin riippuvuus xmlToJsoniin (että säilyy muistissa)
    //luodaan funktio, joka lukee xml:n ja parseroi sen xmldocumentiksi (objektiksi)
  const parseXML = useCallback((xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    return xmlToJson(xmlDoc)          //xmlToJsonin root (tästä lähtee funktion prosessi käyntiin)
  }, [xmlToJson])

  /* //tehdään tietojen lukemiseen
  const getFinnkinoTheatres = (xml) => { //täytyy saada parametrina xml
    const parser = new DOMParser() //käytetään sisäärakennettua parseria, ei tarvitse tuoda mitään
    const xmlDoc = parser.parseFromString(xml, 'application/xml') //luetaan xml-dokumentti, parsitaan xml
    //console.log(xmlDoc) //testataan että palautuuko objektina. Tarkista inpect-network-pyyntö-response
    const root = xmlDoc.children //haetaan root-elementti xml:stä
    //console.log(root) //näytetään console.logissa root, löytyy 1 array
    const theatres = root[0].children //luetaan eka ja ainoa note
    //console.log(theatres) //tarkistetaan että teatteri collection löytyy ja sieltä 2 lasta, ID ja name
    //forilla käydään läpi kaikki teatterit ja innerHTML lukee arvot xml:län sisältä. Consolessa näkyy nyt Id ja nimi
    const tempAreas = [] //luodaan tyhjä array tempAreas
    for (let i = 0; i < theatres.length; i++) {
      //console.log(theatres[i].children[0].innerHTML) //näytetään arrayn eka arvo, eli id
      //console.log(theatres[i].children[1].innerHTML) //näytetään arrayn toka arvo, eli name
      tempAreas.push( //pushataan uusi objekti tähän
        {
          "id": theatres[i].children[0].innerHTML,
          "name": theatres[i].children[1].innerHTML
        }
      )
    }
    //kun on luupattu läpi ja tehty tempAreas, voidaan pävittää tilamuuttuja sen arvoilla
    setAreas(tempAreas)
  } */

  //tehdään datanhakuun useEffect
  useEffect(() => {
    fetch('https://www.finnkino.fi/xml/TheatreAreas/') //tässä osoite TheatreAreas apiin, ei tarvita api-keytä
      .then(response => response.text()) //palauttaa xml (tekstiä)
      .then(xml => { //käsitellään xml
        //console.log(xml)              //ensin testataan, että xml palautuu stringinä
        //getFinnkinoTheatres(xml)      //kutsutaan funktiota ja annetaan sille xml parametrina
        const json = parseXML(xml)      //muista kutsua parseXML:lää!!!!! palautuu json muuttujaan json
        console.log(json.TheatreAreas.TheatreArea)               //testataan näkyykö jsonina
        setAreas(json.TheatreAreas.TheatreArea) //päivitetään tilamuuttuja
      })
      .catch(error => {
        console.log(error)              //tarkistetaan toimiiko
      })
  }, [])                                //tyhjä riippuvuustaulukko, eli ajetaan kerran kun sivu renderöidään
  

  return (
   <div>
    <select> 
      {
        areas.map(area => (             //mapataan läpi tilamuuttuja areas
          <option key = {area.ID}>{area.Name}</option> //option keyt täytyy laittaa kun peräkkäisiä optioneja samalla tasolle
        ))                                             //näytetään alaspudotusvalikossa (select) name child arvot (HUOM! vaihda kenttien nimet samoiksi, mitkä näkyvät JSONissa)
      }
    </select>
   </div>
  )
}

export default App
