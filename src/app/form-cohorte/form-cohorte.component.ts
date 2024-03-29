import { Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { SolutionService } from '../solution.service';
import L, { LatLngExpression } from 'leaflet';
import { __propKey } from 'tslib';
import { ArcService } from '../arc.service';
import { iconDefault, iconViolet } from '../include/leaflet-icons';
import { Cohorte, Type, Tube, Arc, Solution } from '../include/interfaces';

/**
 * FormCohorteComponent gère la sélection de la cohorte, du type et du tube voulu
 */
@Component({
  selector: 'app-form-cohorte',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './form-cohorte.component.html',
  styleUrl: './form-cohorte.component.scss'
})
export class FormCohorteComponent {
  /**
   * Carte Leaflet du composant principal
   */
  @Input() map!: L.Map;

  /**
   * Liste des marqueurs Leaflet de la carte (1 marqueur par ville)
   */
  @Input() markersArray!: L.Marker[];

  /**
   * Marqueur de la ville de départ de la cohorte
   */
  cohorteMarker: L.Marker | undefined = undefined;

  /**
   * Variable contenant la cohorte choisie dans le formulaire
   */
  cohorte: Cohorte = {
    nbPatients: 0,
    city: "",
    types: []
  };

  /**
   * Variable contenant le type de tube choisi dans le formulaire
   */
  type: Type = {
    name: "",
    tubes: []
  }

  /**
   * Variable contenant le tube choisi dans le formulaire
   */
  tube: Tube = {
    number: 0,
    volume: 0,
    arcs: []
  }

  /**
   * Solution provenant de SolutionService (Initialisée en amont depuis le service même)
   */
  solution: Solution = this.solutionService.getSolution();
  
  /**
   * Constructeur du composant
   * @param solutionService Service permettant de créer l'objet Solution
   * @param arcService Service permettant de créér les arcs
   */
  constructor(private solutionService:SolutionService, private arcService:ArcService){
    //this.solution = solutionService.solution;
  }

  /**
   * Gère la sélection d'une nouvelle cohorte dans le formulaire
   * @param e Contient l'ancienne cohorte et la nouvelle choisie
   */
  cohorteChange(e: MatSelectChange){
    var city:string = e.value.city;
    for (const marker of this.markersArray){
      if(marker.options.alt == city){
        if(this.cohorteMarker == undefined){
          this.cohorteMarker = marker;
          this.cohorteMarker.setIcon(iconViolet);
        }
        else{
          this.cohorteMarker.setIcon(iconDefault); // Reset the previous marker icon
          this.cohorteMarker = marker;
          this.cohorteMarker.setIcon(iconViolet); // Change the current marker
        }
        
      }
    }
    this.arcService.setCohorteCity(city);
    this.type = {
      name: "",
      tubes: []
    }
    this.typeChange();
  }

  /**
   * Gère la sélection d'un nouveau type de tube dans le formulaire
   */
  typeChange(){
    this.tube = {
      number: 0,
      volume: 0,
      arcs: []
    }
    this.tubeChange();
  }

  /**
   * Gère la sélection d'un nouveau tube dans le formulaire
   */
  tubeChange(){
    this.removeArcs();
    this.drawPolylines(this.map, this.tube.arcs)
    this.arcService.setPolylineArray(this.tube.arcs);
  }

  /**
   * Efface tous les arcs créés
   */
  removeArcs(){
    this.map.eachLayer((layer:any) =>{
      if (layer instanceof L.Polyline) {
        this.map.removeLayer(layer);
      }
    });
  }

  /**
   * Dessine les arcs en entrée sur la carte
   * @param map La carte sur laquelle les arcs doivent être ajoutés
   * @param
   */
  private drawPolylines(map:L.Map, arcs: Arc[]){
    for (const arc of arcs){
      arc.polyline.bindTooltip(`<div>Quantité : ${ arc.quantity }</div>`);
      arc.polyline.addTo(map);
    }
  }
}
