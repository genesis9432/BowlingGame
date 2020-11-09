//funcion para saber los pines tirados, aleatorio
function ejecutar_tiro($pines_restantes){
    return Math.round(Math.random() * $pines_restantes);
}

//clase frame
function frame($tiros_disponibles = 2, $pines_disponibles = 10, $pines_tirados = 0, 
        $frame_terminado = false, $derecho_a_bonus = false, $bonus = 0, 
        $tiros_hechos = 0, $es_strike = false,
        $es_spare = false, $total = 0, $frame_siguiente = {}, $frame_anterior = {}, 
        $total_simple = 0){
    return {
        pines_disponibles : $pines_disponibles,
        pines_tirados     : $pines_tirados,
        tiros_disponibles : $tiros_disponibles,
        frame_terminado   : $frame_terminado,
        derecho_a_bonus   : $derecho_a_bonus,
        bonus             : $bonus,
        tiros_hechos      : $tiros_hechos,
        es_strike         : $es_strike,
        es_spare          : $es_spare,
        total             : $total,
        total_simple      : $total_simple,
        bonus_decimo_frame: 0,
        frame_siguiente   : $frame_siguiente,
        frame_anterior    : $frame_anterior,
        calcular_bonus_spare: function (){
            if(this.frame_siguiente.frame_terminado == true && this.total <= 10){
                this.bonus = this.frame_siguiente.total_simple;
                this.total = this.bonus + this.total;
            }
        },
        calcular_bonus_strike: function (){
            if( this.frame_siguiente.frame_terminado == true &&
                this.frame_siguiente.frame_siguiente.frame_terminado == true && 
                this.total <= 10){
                this.bonus = this.frame_siguiente.total_simple + this.frame_siguiente.frame_siguiente.total_simple;
                this.total = this.bonus + this.total;
            }
        },
        calcular_bonus_noveno_frame: function(){
            if(this.frame_siguiente.frame_terminado == true && this.total <= 10){
                this.bonus = this.frame_siguiente.bonus_decimo_frame;
                this.total = this.bonus + this.total;   
            }
        }
    }
}

//
//$frames = array de Objeto frame
function mostrar_resultados($frames){
    var total_juego = $frames.reduce(($acumulador, $item, $indice, $array) => {
        console.log('FRAME: '       + ($indice + 1) + ($item.es_strike ? ' Strike!' : '') + ($item.es_spare  ? ' Spare!'  : ''));
        console.log('Frame Total: ' + $item.total + '\n');
        return $acumulador + $item.total;
    }, 0);
    console.log('\nTOTAL DEL JUEGO: ' + total_juego);
}

//
//$f = Objeto frame
//$n = posicion del frame en array, 0 - 9
function calcular_bonuses($f, $n){
    //ft = frame_temporal
    var ft = $f.frame_anterior;
    $n -= 1;
    while(ft !== null){
        //condiciiones especiales para calculo del 9no frame debido a los 
        //puntos extras que puede llegar a tener el 10mo frame
        if($n == 8 && ft.frame_siguiente.frame_terminado ==  true && 
            ft.derecho_a_bonus == true){
            ft.calcular_bonus_noveno_frame();
        }else{
            if(ft.es_strike && 
               ft.frame_siguiente.frame_terminado ==  true &&
               ft.frame_siguiente.frame_siguiente.frame_terminado == true && 
               ft.derecho_a_bonus == true){
                ft.calcular_bonus_strike();
            }
            if(ft.es_spare && 
               ft.frame_siguiente.frame_terminado ==  true && 
               ft.derecho_a_bonus == true){
                ft.calcular_bonus_spare();
            }
        }

        ft = ft.frame_anterior;
    }
}

//fa = frame_actual
var fa           = {};
//numero_de_fa = variable que mantiene la posicion del frame actual en el array
var numero_de_fa = 0;

//array de objetos clase frame
var frames = [
    frame(),frame(),frame(),frame(),frame(),frame(),frame(),frame(),
    frame(), frame(3)
];

//enlazar objetos entre si // lista enlazada
frames[0].frame_siguiente = frames[1]; frames[0].frame_anterior = null;
frames[1].frame_siguiente = frames[2]; frames[1].frame_anterior = frames[0];
frames[2].frame_siguiente = frames[3]; frames[2].frame_anterior = frames[1];
frames[3].frame_siguiente = frames[4]; frames[3].frame_anterior = frames[2];
frames[4].frame_siguiente = frames[5]; frames[4].frame_anterior = frames[3];
frames[5].frame_siguiente = frames[6]; frames[5].frame_anterior = frames[4];
frames[6].frame_siguiente = frames[7]; frames[6].frame_anterior = frames[5];
frames[7].frame_siguiente = frames[8]; frames[7].frame_anterior = frames[6];
frames[8].frame_siguiente = frames[9]; frames[8].frame_anterior = frames[7];
frames[9].frame_siguiente = null     ; frames[9].frame_anterior = frames[8];

//iniciamos en el primer frame
fa = frames[0];

//mantenemos el estado del juego
var juego_terminado = false;


while(juego_terminado == false){
    if(fa.frame_terminado == false){
        var tiro = 0;
        //condiciones especiales para calculo de resultados del ultimo frame
        if(numero_de_fa == 9){
            while(fa.tiros_hechos < fa.tiros_disponibles && fa.frame_terminado == false){
                tiro = ejecutar_tiro(fa.pines_disponibles - fa.pines_tirados);
                fa.pines_tirados += tiro;
                fa.total = fa.total_simple = fa.bonus_decimo_frame = tiro; 
                fa.tiros_hechos += 1;

                if(fa.pines_tirados == 10){
                    fa.es_strike     = true;
                    fa.pines_tirados = 0;

                    tiro = ejecutar_tiro(fa.pines_disponibles - fa.pines_tirados);
                    fa.pines_tirados      += tiro;
                    fa.total              += tiro;
                    fa.bonus_decimo_frame += tiro;
                    fa.tiros_hechos       += 1;

                    if(fa.pines_tirados == 10){
                        fa.es_strike     = true;
                        fa.pines_tirados = 0;

                        tiro = ejecutar_tiro(fa.pines_disponibles - fa.pines_tirados);
                        fa.pines_tirados += tiro;
                        fa.total         += tiro;
                        fa.tiros_hechos  += 1;
                        fa.frame_terminado = true;

                    }

                }else{
                    tiro = ejecutar_tiro(fa.pines_disponibles - fa.pines_tirados);
                    fa.pines_tirados += tiro;
                    fa.tiros_hechos  += 1;
                    fa.total         += tiro;
                    fa.total_simple  += tiro;
                    fa.bonus_decimo_frame += tiro;

                    if(fa.pines_tirados == 10){
                        fa.es_spare = true;
                        fa.pines_tirados = 0;
                        tiro = ejecutar_tiro(fa.pines_disponibles - fa.pines_tirados);
                        fa.pines_tirados += tiro;
                        fa.total += tiro;
                        fa.frame_terminado = true;

                    }else{
                        fa.frame_terminado = true;
                    }
                }
            }
            juego_terminado    = true;
        //calculo de resultados para cualquier otro frame
        }else{
            while(fa.tiros_hechos < fa.tiros_disponibles && fa.frame_terminado == false){
                tiro = ejecutar_tiro(fa.pines_disponibles - fa.pines_tirados);
                fa.pines_tirados += tiro;
                fa.total = fa.total_simple = fa.pines_tirados; 
                fa.tiros_hechos += 1;

                if(fa.pines_tirados == 10 && fa.tiros_hechos == 1){
                    fa.es_strike = fa.frame_terminado = fa.derecho_a_bonus = true;
                    fa.frame_terminado = true;
                }else if(fa.pines_tirados == 10 && fa.tiros_hechos == 2){
                    fa.es_spare = fa.frame_terminado = fa.derecho_a_bonus = true;
                    fa.frame_terminado = true;
                }
            }
        }
        fa.frame_terminado = true;
    }//roll/frame
    calcular_bonuses(fa, numero_de_fa);
    numero_de_fa += 1;
    fa = frames[numero_de_fa];
}

mostrar_resultados(frames);
